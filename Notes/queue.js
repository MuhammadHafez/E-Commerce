class queue {
    constructor(){
        this.array = [];
    }

    push(element){
        this.array.push(element);
    }

    pop(){
        this.array.splice(0,1);
    }
}


var myqueue = new queue();
myqueue.push(1);
myqueue.push(2);
myqueue.push(3);
myqueue.push(4);
myqueue.push(5);
myqueue.pop();
myqueue.pop();
myqueue.pop();


console.log(myqueue);