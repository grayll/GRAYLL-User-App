const functions = require('firebase-functions');
const firestore = require('@google-cloud/firestore');
const client = new firestore.v1.FirestoreAdminClient();

// Replace BUCKET_NAME
//const bucket = 'gs://grayll-app-backup';
//const bucket = 'gs://backup-grayllapp';
const bucket = process.env.BACKUP_BUCKET;
exports.scheduledFirestoreExport = functions.pubsub
                                            .schedule('every 24 hours')
                                            .onRun((context) => {

  const projectId = process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT;
  const databaseName = client.databasePath(projectId, '(default)');

  return client.exportDocuments({
    name: databaseName,
    outputUriPrefix: bucket,
    // Leave collectionIds empty to export all collections
    // or set to a list of collection IDs to export,
    collectionIds: []
    //collectionIds: ['users_meta', 'users', 'trades', 'subsriptions', 'resetpwd', 'referrals', 'price_update', 'notices', 'algo_positions', 'accounts_closure']
    })
  .then(responses => {
    if (responses){
    const response = responses[0];
    console.log(`grayllapp-firestore - Operation Name: ${response['name']}`);
    } 
    return null
  })
  .catch(err => {
    console.error(err);
    throw new Error('Export grayllapp-firestore operation failed');
  });
});