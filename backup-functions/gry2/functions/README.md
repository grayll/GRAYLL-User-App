
## SChedule expore firestore
# firebase init functions --project PROJECT_ID
Select JavaScript for the language.
Optionally, enable ESLint.
Enter y to install dependencies.

This will create functions directory

https://firebase.google.com/docs/firestore/solutions/schedule-export

https://firebase.google.com/docs/firestore/manage-data/export-import

# Edit index.js

# Set permission
cd grayll.io-user-app:

gcloud projects add-iam-policy-binding grayll-app-f3f3f3 \
    --member serviceAccount:grayll-app-f3f3f3@appspot.gserviceaccount.com \
    --role roles/datastore.importExportAdmin

gsutil iam ch serviceAccount:grayll-app-f3f3f3@appspot.gserviceaccount.com:admin \
    gs://backup-grayllapp


gcloud config set project grayll-gry-1-balthazar &&  gcloud projects add-iam-policy-binding grayll-gry-1-balthazar \
    --member serviceAccount:grayll-gry-1-balthazar@appspot.gserviceaccount.com \
    --role roles/datastore.importExportAdmin

gsutil iam ch serviceAccount:grayll-app-f3f3f3@appspot.gserviceaccount.com:admin \
    gs://grayll-app-backup

# Deploy
sudo firebase deploy --only functions --set-env-vars BACKUP_BUCKET=gry1-backup

# Import
gcloud firestore import gs://exports-bucket/2017-05-25T23:54:39_76544/

# Import to grayll-app-test
- Create a Cloud Storage bucket to hold the data from your source project.
- Export the data from your source project to the bucket.
- Give your destination project permission to read from the bucket.
- Import the data from the bucket into your destination project.

gcloud config set project grayll-app-test

gsutil mb gs://backup-grayllapptest/

gsutil cp -r gs://backup-grayllapp/2020-07-02T03:33:47_48457/ gs://backup-grayllapptest/

gcloud firestore import gs://backup-grayllapptest/2020-07-02T03:33:47_48457/