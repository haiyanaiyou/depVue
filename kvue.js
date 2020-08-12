class KVue {
    constructor(options){
        this.$options = options;
        this.$data = options.data;
        this.observe(this.$data) //响应式
    }
    observe(value){
        // data值必须为对象
        if(!value || typeof value !== 'object'){
            return
        }
        Object.keys(value).forEach(key=>{
            this.definedReactive(value, key, value[key]);
            this.proxyData(key);
        })
    }
    definedReactive(obj,key,value){
        this.observe(value);//深层嵌套
        Object.defineProperty(obj,key, {
            get(){
                return value
            },
            set(newVal){
                console.log(`视图更新了， ${newVal}`)
                value = newVal
            }
        })

    }
    proxyData(key){
        Object.defineProperty(this,key,{
            get(){
                return this.$data[key]
            },
            set(newVal){
                this.$data[key] = newVal;
            }
        })

    }
}