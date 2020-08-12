class KVue {
    constructor(options) {
        this.$options = options;
        this.$data = options.data;
        this.observe(this.$data) //响应式
        new Watcher(this, 'test');
        this.test;

    }
    observe(value) {
        // data值必须为对象
        if (!value || typeof value !== 'object') {
            return
        }
        Object.keys(value).forEach(key => {
            this.definedReactive(value, key, value[key]);
            this.proxyData(key);
        })
    }
    definedReactive(obj, key, value) {
        this.observe(value); //深层嵌套
        const dep = new Dep();
        Object.defineProperty(obj, key, {
            get() {
                Dep.target && dep.addDep(Dep.target)
                return value
            },
            set(newVal) {
                // console.log(`视图更新了， ${newVal}`)
                if (newVal !== value) {
                    value = newVal
                    dep.notify()
                }
            }
        })

    }
    proxyData(key) {
        Object.defineProperty(this, key, {
            get() {
                return this.$data[key]
            },
            set(newVal) {
                this.$data[key] = newVal;
            }
        })

    }
}

// 通知watcher更新
class Dep {
    constructor() {
        this.deps = [];
    }
    addDep(dep) {
        this.deps.push(dep)
    }
    notify() {
        this.deps.forEach(watcher => watcher.update())
    }
}

class Watcher {
    constructor(vm, key, cb) {
        this.vm = vm;
        this.key = key;
        this.cb = cb;
        Dep.target = this;
    }
    update() {
        console.log(`${this.key} 属性更新了`)
    }
}