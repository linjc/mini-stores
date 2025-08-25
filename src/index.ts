const TYPE_ARRAY = '[object Array]';
const TYPE_OBJECT = '[object Object]';
const TYPE_FUNCTION = '[object Function]';

type PlainObject = Record<string, any>;

function getType(obj: any): string {
    return Object.prototype.toString.call(obj);
}

function setComputed(storeData: PlainObject, value: any, obj: PlainObject, key: string | number): void {
    const type = getType(value);
    if (type === TYPE_FUNCTION) {
        Object.defineProperty(obj, key, {
            enumerable: true,
            get: function () {
                return value.call(storeData);
            },
            set: function () {
                console.warn('计算属性不支持重新赋值');
            }
        });
    } else if (type === TYPE_OBJECT) {
        Object.keys(value).forEach(subKey => {
            setComputed(storeData, value[subKey], value, subKey);
        });
    } else if (type === TYPE_ARRAY) {
        (value as any[]).forEach((item, index) => {
            setComputed(storeData, item, value, index);
        });
    }
}

function deepCopy(data: any): any {
    const type = getType(data);
    if (type === TYPE_OBJECT) {
        const obj: PlainObject = {};
        Object.keys(data).forEach(key => obj[key] = deepCopy(data[key]));
        return obj;
    }
    if (type === TYPE_ARRAY) {
        return (data as any[]).map(deepCopy);
    }
    return data;
}

function getNowPage(): any {
    const pages = getCurrentPages();
    return pages[pages.length - 1];
}

function setState(vm: any, data: PlainObject): Promise<void> {
    vm._new_data = vm._new_data || {};
    Object.assign(vm._new_data, data);
    return new Promise(resolve => {
        Promise.resolve().then(() => {
            if (vm._new_data) {
                const diffState = getDiffState(vm._new_data, vm.data);
                vm._new_data = null;
                vm.setData(diffState, resolve);
            } else {
                resolve();
            }
        });
    });
}

function getDiffState(state: any, preState: any): PlainObject {
    const newState: PlainObject = {};
    stateDiff(deepCopy(state), preState, '', newState);
    return newState;
}

function addDiffState(newState: PlainObject, key: string, val: any): void {
    if (key !== '') newState[key] = val;
}

function stateDiff(state: any, preState: any, path: string, newState: PlainObject): void {
    if (state === preState) return;

    const stateType = getType(state);
    const preStateType = getType(preState);

    if (stateType === TYPE_OBJECT) {
        const stateKeys = Object.keys(state);
        const preStateKeys = Object.keys(preState || {});
        const stateLen = stateKeys.length;
        const preStateLen = preStateKeys.length;

        if (path !== '') {
            if (preStateType !== TYPE_OBJECT || stateLen < preStateLen || stateLen === 0 || preStateLen === 0) {
                addDiffState(newState, path, state);
                return;
            }
            preStateKeys.forEach(key => {
                if (state[key] === undefined) {
                    state[key] = null;
                    if (!stateKeys.includes(key)) {
                        stateKeys.push(key);
                    }
                }
            });
        }

        stateKeys.forEach(key => {
            const subPath = path === '' ? key : `${path}.${key}`;
            stateDiff(state[key], preState[key], subPath, newState);
        });
        return;
    }

    if (stateType === TYPE_ARRAY) {
        if (preStateType !== TYPE_ARRAY || state.length < preState.length || state.length === 0 || preState.length === 0) {
            addDiffState(newState, path, state);
            return;
        }

        preState.forEach((_: any, index: number) => {
            if (state[index] === undefined) state[index] = null;
        });

        state.forEach((item: any, index: number) => {
            stateDiff(item, preState[index], `${path}[${index}]`, newState);
        });
        return;
    }

    addDiffState(newState, path, state);
}

function getVmRoute(vm: any): string {
    return vm.route;
}

function initRoute(vm: any): string {
    return vm.route || vm.__route__;
}

interface BoundVM {
    vm: any;
    key: string;
}

type WatchCallback = (value: any, oldValue: any) => void
interface WatchItem {
    value: any,
    paths: string[],
    callbacks: {
        vm?: any,
        callback: WatchCallback,
    }[]
}

function getValueByPaths(data: any, paths: string[]) {
    let value = data
    paths.forEach(key => {
        value = value?.[key]
    })
    return value
}

export class Store {
    private __vms: BoundVM[] = [];
    private __delayTimer: ReturnType<typeof setTimeout> | null = null;
    private __isReadyComputed: boolean = false;
    private __watchTimer: any = null;
    private __watchMap: Record<string, WatchItem> = {}
    public data: PlainObject = {};

    public watch = {
        on: (key: string, callback: WatchCallback, vm?: any) => {
            if (!key || typeof callback !== 'function') {
                console.warn(`请传入正确参数，如store.watch.on('key', () => {})`)
                return
            }
            key = String(key)
            if (!this.__watchMap[key]) {
                const paths = String(key).split('.').filter(f => !!f)
                if (!paths.length) return
                this.__watchMap[key] = {
                    paths,
                    value: getValueByPaths(this.data, paths),
                    callbacks: []
                }
            }
            this.__watchMap[key].callbacks.push({ vm, callback })
        },
        off: (key: string, callback: WatchCallback) => {
            key = String(key)
            if (!this.__watchMap[key]) return
            this.__watchMap[key].callbacks = this.__watchMap[key].callbacks.filter(f => f.callback !== callback)
        }
    }

    constructor() {
        setTimeout(() => {
            this._setComputed();
        }, 0);
    }

    private _setComputed(): void {
        if (!this.__isReadyComputed) {
            this.__isReadyComputed = true;
            setComputed(this.data, this.data, this.data, '');
        }
    }

    public bind(vm: any, key: string): void {
        if (!key) {
            console.error(`请设置store在当前组件实例data中的key，如store.bind(this, '$store')`);
            return;
        }
        vm.data = vm.data || {};
        vm.data[key] = null;

        this._setComputed();
        setState(vm, { [key]: this.data });

        if (!this.__vms.some(f => f.vm === vm && f.key === key)) {
            this.__vms.push({ vm, key });
            const rootVm = vm.$page || vm.pageinstance || getNowPage() || {};
            vm.route = initRoute(vm) || initRoute(rootVm);
        }
    }

    public unbind(vm: any): void {
        this.__vms = this.__vms.filter(f => f.vm !== vm);
        Object.keys(this.__watchMap).forEach(key => {
            this.__watchMap[key].callbacks = this.__watchMap[key].callbacks.filter(f => f.vm !== vm)
        })
    }

    public update(): void {
        const nowVm = getNowPage();
        const nowVmRoute = getVmRoute(nowVm)
        const delayVms: BoundVM[] = [];

        this.__vms.forEach(f => {
            const vmRoute = getVmRoute(f.vm);
            if (nowVmRoute === vmRoute) {
                setState(f.vm, { [f.key]: this.data });
            } else {
                delayVms.push(f);
            }
        });

        clearTimeout(this.__watchTimer)
        this.__watchTimer = setTimeout(() => {
            Object.keys(this.__watchMap).forEach(key => {
                const item = this.__watchMap[key]
                const value = getValueByPaths(this.data, item.paths)
                const oldValue = item.value
                if (oldValue !== value) {
                    item.value = value
                    item.callbacks.forEach(f => f.callback(value, oldValue))
                }
            })
        }, 0)

        if (!delayVms.length) return;

        clearTimeout(this.__delayTimer as ReturnType<typeof setTimeout>);
        this.__delayTimer = setTimeout(() => {
            delayVms.forEach(f => setState(f.vm, { [f.key]: this.data }));
        }, 360);
    }
}
