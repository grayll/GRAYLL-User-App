const functions = require('firebase-functions');
const Firestore = require('@google-cloud/firestore');
const firebase_tools = require('firebase-tools')
//const client = new firestore.v1.FirestoreAdminClient();


const token = '1//0ek4QbJ9OmCzqCgYIARAAGA4SNwF-L9IrP_C0jtDJKpEh9HdJ8TTe8uPtW0LEYyM4V7XG910OW7jL_Ro1oA6bjlOG38zs2yD88Hs'

const admin = require('firebase-admin');
admin.initializeApp();

// const db = new Firestore({
//   projectId: 'grayll-system',
//   keyFilename: './grayll-system-b2317e64062b.json'
// });

// const snapshot = db.collection('position_values_remove').limit(20).get();
// snapshot.forEach((doc) => {
  
//   this.recursiveDelete('algo_position_values/graylltxs/'+doc.id)
//   console.log('REMOVED ' , doc.id);
// });



// exports.recursiveDelete = function(path){
//   firebase_tools.firestore
//   .delete(path, {
//     project: 'grayll-system',
//     recursive: true,
//     yes: true,
//     token: token
//   });
// }

exports.DeletePositionValueFrames = functions.pubsub
                                            .schedule('every 60 minutes')
                                            .onRun( async (context) => {

  //const projectId = process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT; 

  const db = admin.firestore();
 
  let docsNumber = process.env.DOC_NUMBER;
  if (!docsNumber) {
    docsNumber = 5;
  }

  const delRef = db.collection('position_values_remove');
  const snapshot = await delRef.limit(docsNumber).get();
  
  
  if (snapshot.empty) {
    console.log('Position value to remove is empty');
    //throw new Error("Profile doesn't exist");
  } else {  
    snapshot.forEach(doc => {       
      console.log('START REMOVED' , doc.id);
      await firebase_tools.firestore.delete('algo_position_values/graylltxs/'+doc.id, {
        project: 'grayll-system',
        recursive: true,
        yes: true,
        token: token
      });

      await doc.ref.delete();    
      
    });    
  } 
});


// const functions = require('firebase-functions');
// const Firestore = require('@google-cloud/firestore');
// const firebase_tools = require('firebase-tools')
// //const client = new firestore.v1.FirestoreAdminClient();


// const token = '1//0ek4QbJ9OmCzqCgYIARAAGA4SNwF-L9IrP_C0jtDJKpEh9HdJ8TTe8uPtW0LEYyM4V7XG910OW7jL_Ro1oA6bjlOG38zs2yD88Hs'

// const admin = require('firebase-admin');
// admin.initializeApp();

// // const db = new Firestore({
// //   projectId: 'grayll-system',
// //   keyFilename: './grayll-system-b2317e64062b.json'
// // });

// // const snapshot = db.collection('position_values_remove').limit(20).get();
// // snapshot.forEach((doc) => {
  
// //   this.recursiveDelete('algo_position_values/graylltxs/'+doc.id)
// //   console.log('REMOVED ' , doc.id);
// // });



// exports.recursiveDelete = function(path){
//   firebase_tools.firestore
//   .delete(path, {
//     project: 'grayll-system',
//     recursive: true,
//     yes: true,
//     token: token
//   });
// }

// exports.DeletePositionValueFrames = functions.pubsub
//                                             .schedule('every 60 minutes')
//                                             .onRun((context) => {

//   //const projectId = process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT;
  

//   const db = admin.firestore();
 
//   let docsNumber = process.env.DOC_NUMBER;
//   if (!docsNumber) {
//     docsNumber = 3;
//   }

//   console.log('Start Del position value frames', docsNumber);

//   const delRef = db.collection('position_values_remove');

//   delRef.limit(docsNumber).get().then(snapshot => {
//     if (snapshot.empty) {
//       console.log('Position value to remove is empty');
//       throw new Error("Profile doesn't exist")
//     } else {  
//       snapshot.forEach(doc => {  
//         // this.recursiveDelete('algo_position_values/graylltxs/'+doc.id).then(() => {
//         //   console.log('REMOVED ' , doc.id);
//         //   doc.ref.delete();      
//         //   return ''   
//         // }).catch(e => console.log(e)) ; 
//         console.log('START REMOVED' , doc.id);
//         firebase_tools.firestore
//         .delete('algo_position_values/graylltxs/'+doc.id, {
//           project: 'grayll-system',
//           recursive: true,
//           yes: true,
//           token: token
//         }).then(()=> {
//             console.log('REMOVED ' , doc.id);
//              doc.ref.delete();    
//              return ''  

            
//         }).catch(e => console.log(e)) ;
        
        
//       });
//       return ''
//     }

//   }).catch(e => {
//     console.log(e)
//   });

 
// });





