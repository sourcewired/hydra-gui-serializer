
 module.exports = function (ng) {

   ng.module("hydra-gui-serializer", [])

   /**
    * HSerializer
    * 
    * Serialize different JavaScript types into different string formats.
    * 
    */
   .factory("HSerializer", function () {

      var Factory = {
         
         param: function ($value, prefix) {
            var ret = [], p;
            for (p in $value) {
               if ($value.hasOwnProperty(p)) {
                  var key = prefix ? prefix + "[" + p + "]" : p,
                     val = $value[p];
                  ret.push(
                     (val !== null && (ng.isObject(val) || ng.isArray(val))) ?
                        Factory.param(val, key) :
                        encodeURIComponent(key) + "=" + encodeURIComponent(val)
                  );
               }
            }
            return ret.join("&");
         },

         unparam: function ($value) {
            console.log("TODO");
         },

         base64Encode: function ($value) {
            console.log("TODO");
         },

         base64Decode: function ($value) {
            console.log("TODO");
         },

         serialize: function ($value) {
            var type = typeof $value,
                temp, result;

            $level = ng.isNumber($level) ? $level : 0;

            switch (type) {
            case "string":
            case "number":
            case "boolean":
            case "undefined":
            case "function":
                result = {
                    t: type.charAt(0),
                    v: $value.toString()
                };
                break;
                
            case "object":
                if (ng.isDate($value)){
                    // Date
                    result = {
                        t: "d",
                        v: $filter("date")($value, "yyyy-MM-dd HH:mm:ss")
                    };
                } 
                
                else if (ng.isArray($value)) {
                    // Array
                    temp = [];
                    for (var i = 0; i < $value.length; i++) {
                        temp.push(serialize($value[i], $level + 1));
                    }
                    result = {
                        t: "a",
                        v: temp
                    };
                }
                
                else if (
                    value instanceof Element ||
                    value instanceof HTMLElement ||
                    value instanceof HTMLDocument
                ) {
                    // HTML Element
                    console.warn ("TODO - serialize html elements");
                } 
                
                else {
                    // POJO
                    temp = {};
                    for (var key in $value) {
                        temp[key] = serialize($value[key], $level + 1);
                    }
                    result = {
                        t: "o",
                        v: temp
                    };
                }
                break;
            }

            // only json encode at the end - to save characters
            return (!$level) ? ng.toJson(result) : result;
         },

         deserialize: function ($value) {
            var temp = (ng.isString($value)) ? 
                ng.fromJson($value) : $value,
                ret, und;

            if (ng.isObject(temp) && temp.t) {
                switch (temp.t) {
                    case "s":
                        return temp.v + "";

                    case "n":
                        return Number(temp.v);

                    case "b":
                        return (temp.v && temp.v === "true")

                    case "u":
                        return und;

                    // should we eval the function back to a "real" function ?
                    case "f":
                        console.warn("function deserializing is not implemented");
                        return temp.v;

                    case "d":
                        return new Date(
                            Date.parse($date.replace(/[-]/g, "/"))
                        );

                    case "a":
                        ret = [];
                        for (var i = 0; i < temp.v.length; i++) {
                            ret.push(deserialize(temp.v[i]));
                        }
                        return ret;

                    case "o":
                        ret = {};
                        for (var key in temp.v) {
                            ret[key] = deserialize(temp.v[key]);
                        }
                        return ret;

                }
            }

            return "";
         }
      };

      return Factory;
   });
 };