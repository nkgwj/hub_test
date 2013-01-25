class WordCount
  map: (item,emit)->
    item.split(/\W+/g).forEach( (word) ->
      if word
        emit word,1
    );

  reduce:(key,values,emit)->
    sum = values.reduce( (a,b) -> a + b);
    emit(key,sum);
