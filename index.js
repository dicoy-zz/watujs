var bagOfTricks = (function(){
  return function(){}
})();

var context = (function(){
  var now = {};
  try{
    now = JSON.parse(localStorage.getItem("watu"));
  }
  catch(e){
    now = {hi: "hello"}
  }
  return function(c){
    if(typeof c === "string") 
      return now[c];
    if(typeof c === "object"){
      Object.assign(now,c);
      localStorage.setItem("watu", JSON.stringify(now));
    }
    return now;
  }
})();
function observable(value) {
  var listeners = [];

  function notify(newValue) {
    listeners.forEach(function(listener){ listener(newValue); });
  }

  function accessor(newValue) {
    if (arguments.length && newValue !== value) {
      value = newValue;
      notify(newValue);
    }
    return value;
  }

  accessor.subscribe = function(listener) { listeners.push(listener); };

  return accessor;
}
function observer(calculation, dependencies) {
  var value = observable(calculation());

  function listener(v) {value(calculation()); }
  dependencies.forEach(function(dependency) {
    dependency.subscribe(listener);
  });

  function getter() { return value(); }
  getter.subscribe = value.subscribe;

  return getter;
}
function bind(element, observable) {
  var initial = observable();
  if (typeof element.value === "string"){
    element.value = initial;
    observable.subscribe(function(){ element.value = observable(); });
    var converter = function(v) { return v; };
    if (typeof initial == 'number') {
      converter = function(n){ return isNaN(n = parseFloat(n)) ? 0 : n; };
    }
    element.addEventListener('input', function() {
      observable(converter(element.value));
    });
  }else{
    element.innerText = initial;
    observable.subscribe(function(){ element.innerText = observable(); });
    var converter = function(v) { return v; };
    if (typeof initial == 'number') {
      converter = function(n){ return isNaN(n = parseFloat(n)) ? 0 : n; };
    }
    element.addEventListener('input', function() {
      observable(converter(element.innerText));
    });
  }
}
function dom(type, data, properties){
  var thing = document.createElement(type);
  if (typeof data === "object"){
    if (data.toDo && data.use){
      data = observer(data.toDo, data.use);
    }
    if (data.timeout){
      data = observable(data.timeout);
      setTimeout(()=>{data(0); document.body.removeChild(thing);}, data());
    }
  }else{
    data = observable(data);
  }
  if (properties)
    Object.keys(properties).map(k=> thing[k] = properties[k]);
  document.body.appendChild(thing);
  bind(thing, data);
  return data;
}
function factory(text){
  window[text] = function(data, properties){
    return dom(text, data, properties);
  }
}
//------------------- helpers
["input","p","img","div", "br"]
  .map(type=>factory(type));

function where(statement){
  var terms = statement.split("=")
  return function(thing){
    return thing[terms[0]]===terms[1];
  }
}
//------------------- the app itself

img(
  {timeout:1555}, 
  {src: "https://68.media.tumblr.com/tumblr_lzkxcvjXAb1r60gblo1_500.gif"}
);

p([
   {sylable:"Fil",good:"yes"},
   {sylable:"na",good:"no"},
   {sylable:"ha",good:"no"},
   {sylable:"te",good:"yes"},
   {sylable:"red",good:"yes"},
   {sylable:" mes",good:"yes"},
   {sylable:"na",good:"no"},
   {sylable:"sa",good:"yes"},
   {sylable:"na",good:"no"},
   {sylable:"ge",good:"yes"}
]
  .filter(where("good=yes"))
  .map(l=>l.sylable)
  .join(""))

p("A calculator");
var a = input(3);
div("+");
var b = input(2);
div("=");
var c = input({
  use:[a, b],
  toDo:() =>  a() + b()
},{
  readOnly: true
});

p("Here's the good stuff")
var d = input("hi");
div({
  use:[d],
  toDo:() =>  context(d())
});
