class linkedList{
    constructor(){
        this.array = [];
    }
    insertEnd(element){
        this.array.push(element);
    }
    insertFront(element){
        this.array.unshift(element);
    }   

    insertafter(current , element){
        this.array.splice(current+1 , 0 ,element);
    }

    pop(val){
        var index =this.array.indexOf(val);
        this.array.splice(index,1);
    }
}

var list = new linkedList();

list.insertFront(1);
list.insertEnd(2);
list.insertFront(3);
list.insertEnd(4);
list.insertFront(5);
list.insertafter(0,10);

list.pop(4);
list.pop(2);


console.log(list);