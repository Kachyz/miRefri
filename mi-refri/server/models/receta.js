'use strict';
var app = require('../../server/server')

module.exports = function(Receta) {

    Receta.compara = function(ingredientes,cb){
        console.log(ingredientes);
        let allRecipies = {}
        for(let currentIngrediente of ingredientes){
console.log('revisando', currentIngrediente)
          app.models.ingrediente.findOne({where: {nombre: currentIngrediente}}, (err, model) => {
            for(let idRecipe of model.recetas){
console.log('all-',allRecipies)
              if(idRecipe in allRecipies){
                console.log('check in idRecipe',allRecipies[idRecipe])
                allRecipies[idRecipe].tengo.push(currentIngrediente)
                console.log(currentIngrediente, 'agregado a receta', allRecipies[idRecipe].nombreReceta)
              } else {
                console.log('inicio else', idRecipe)
                //find al id para sacar el nombre de la receta y que se necesita de ingredientes
                app.models.receta.findOne({where: {id: idRecipe}}, (err, receta) => {
                  console.log('Agregando receta', receta.nombre)

                  let ingredientesReceta = receta.ingredientes.map( ing => ing.name )

                  allRecipies[idRecipe] = {
                    'nombreReceta': receta.nombre, 
                    'tengo': [],
                    'necesito': ingredientesReceta, 
                    'porcentaje': "0%"
                  }
                  allRecipies[idRecipe].tengo.push(currentIngrediente)
                  console.log('toditas',allRecipies)
                })
              }
            }
          })
// KACHYZ, necesito volver la seccion de arriba sincrona para evitar que se sobreescriba informacion y tener todos los datos bien          
        }
        console.log("todos las recetas (de momento)\n", allRecipies)

        // despues de que todo esta creado hacer un recorrido de todas las recetas y calcular el porcentaje de match
        // regresar ese JSON
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
                arg:'recetas',
                type:{}
            },
        }
    );

    Receta.observe('after save', function(ctx, next){
      console.log(ctx.instance)
      let newRecipe = ctx.instance

      for(let ingrediente of newRecipe.ingredientes){
        app.models.ingrediente.findOrCreate(
          {where: {nombre: ingrediente.name}}, 
          {
            "nombre": ingrediente.name,
            "recetas": [newRecipe.id]
          },
          (err, instance, created) => {
            if(!created){
              instance.recetas.push(newRecipe.id)
              instance.save((err, instance) => {
                console.log('Ingrediente actualizado', instance)
              })
            }
          }
        )
      }

      next();
    })

};

