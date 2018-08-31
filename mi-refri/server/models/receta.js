'use strict';
var app = require('../../server/server')

module.exports = function(Receta) {

    Receta.compara = function(ingredientes,cb){
        console.log(ingredientes[0].name);
        cb(null,ingredientes);
    }

    Receta.remoteMethod(
        'compara',{
            description:'Aqui es donde voy a comparar los ingredientes contra las recetas',
            http:{path:'/compara',verb:'post'},
            accepts:{
                arg:'ingredientes',
                type:[], 
                http:{source:'body'},
                required:true
            },
            returns:{
                arg:'resp',
                type:{}
            },
        }
    );

    Receta.observe('after save', function(ctx, next){
      console.log(ctx.instance)
      // ctx.intance.ingredientes //array
      //Account.find({where: {name: 'John'}, limit: 3}, function(err, accounts) { /* ... */ });

      app.models.Receta.find({where: {id: '5b88a065f1ed047281533ecc'}}, function(err, receta){
        console.log('Desde el observe', receta)
      })

      next();
    })

};

