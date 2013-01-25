class WordCount {
  constructor() {
  }	
   
  map(item,emit) {
    item.split(/\W+/g).forEach(word => {
      if(word) emit(word,1);
    });
  }
  
  reduce(key,values,emit){
	var sum = values.reduce( (a,b) => a + b);
	emit(key,sum);
  }
}


										