class Compile {
    constructor(el, vm) {
        this.$el = document.querySelector(el);
        this.$vm = vm;
        if (this.$el) {
            //将宿主中模板内容暂存在fragement中
            // 编译模板内容，进行依赖收集
            this.$fragement = this.nodeToFragement(this.$el);
            this.compile(this.$fragement);
            this.$el.appendChild(this.$fragement);
        }
    }
    nodeToFragement(el) {
        const fragement = document.createDocumentFragment();
        let child;
        while ((child = el.firstChild)) {
            fragement.appendChild(child)
        }
        return fragement
    }
    compile(el) {
        const childNodes = el.childNodes;
        Array.from(childNodes).forEach(node => {
            // 判断节点类型
            if (this.isElement(node)) {
                // console.log(`编译元素节点 ${node.nodeName}`)
                this.compileElement(node);
            } else if (this.isInterpolation(node)) {
                // console.log(`编译文本 ${node.textContent}`)
                this.compileText(node)
            }
            // 递归子元素
            if (node.childNodes && node.childNodes.length >= 0) {
                this.compile(node)
            }
        })
    }
    isElement(node) {
        return node.nodeType === 1;
    }
    isInterpolation(node) {
        return node.nodeType === 3 && /\{\{(.*)\}\}/.test(node.textContent)
    }
    compileText(node) {
        // RegExp.$1 为正则匹配的那部分
        console.log(RegExp.$1)
        const exp = RegExp.$1
        // node.textContent = this.$vm[RegExp.$1];
        this.update(node, this.$vm, exp, 'text')
    }
    // dir指具体操作 比如：text model html
    update(node, vm, exp, dir) {
        const fn = this[dir + 'Updator'];
        fn && fn(node, vm[exp])
        // 创建watcher
        new Watcher(vm, exp, function () {
            fn && fn(node, vm[exp])

        })
    }
    textUpdator(node, value) {
        node.textContent = value;

    }
    compileElement(node) {
        // 查看是否有指令 或者@ 事件
        const attrs = node.attributes;
        console.log(attrs)
        Array.from(attrs).forEach(attr => {
            // 获取属性和值 如k-text='name' k-text为属性，name为值
            const attrName = attr.name;
            const exp = attr.value;
            // 指令判断 k-xx
            if (attrName.indexOf('k-') === 0) {
                const dir = attrName.substring(2);
                this[dir] && this[dir](node, this.$vm, exp)

            } else if (attrName.indexOf('@' === 0)) {
                // @事件
                const eventName = attrName.substring(1);
                this.eventHandler(node, this.$vm, exp, eventName)

            }
        })

    }
    eventHandler(node, vm, value, eventName) {
        // 获取回调函数
        const fn = vm.$options.methods && vm.$options.methods[value];
        if(eventName && fn){
            node.addEventListener(eventName, fn.bind(vm))

        }

    }
    text(node, vm, exp) {
        this.update(node, vm, exp, 'text')
    }
    model(node, vm, exp) {
        // 修改界面上的数据
        this.update(node, vm, exp, 'model')
        // 获取界面上的数据
        node.addEventListener('input', e => {
            vm[exp] = e.target.value;
        })
    }
    modelUpdator(node, value) {
        node.value = value
    }

    html(node, vm, exp) {
        this.update(node, vm, exp, 'html')
    }
    htmlUpdator(node, value) {
        node.innerHTML = value;
    }
}