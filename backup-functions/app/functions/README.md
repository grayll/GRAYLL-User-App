
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

- Add AIM grayll-app-f3f3f3@appspot.gserviceaccount.com to grayll-app-back-up with Storage Admin.



# Deploy

gcloud config set project grayll-gry-1-balthazar &&  gcloud projects add-iam-policy-binding grayll-gry-1-balthazar \
    --member serviceAccount:grayll-gry-1-balthazar@appspot.gserviceaccount.com \
    --role roles/datastore.importExportAdmin

gsutil iam ch serviceAccount:grayll-app-f3f3f3@appspot.gserviceaccount.com:admin \
    gs://gry1-backup
    

sudo firebase deploy --only functions 

-- gry2:
firebase init functions --project grayll-gry-2-kaspar

gcloud config set project grayll-gry-2-kaspar &&  gcloud projects add-iam-policy-binding grayll-gry-2-kaspar \
    --member serviceAccount:grayll-gry-2-kaspar@appspot.gserviceaccount.com \
    --role roles/datastore.importExportAdmin

--gry3:
firebase init functions --project grayll-gry-3-melkior
gcloud config set project grayll-gry-3-melkior &&  gcloud projects add-iam-policy-binding grayll-gry-3-melkior \
    --member serviceAccount:grayll-gry-3-melkior@appspot.gserviceaccount.com \
    --role roles/datastore.importExportAdmin
--grz:
firebase init functions --project grayll-grz-arkady
gcloud config set project grayll-grz-arkady &&  gcloud projects add-iam-policy-binding grayll-grz-arkady \
    --member serviceAccount:grayll-grz-arkady@appspot.gserviceaccount.com \
    --role roles/datastore.importExportAdmin

--grayll system:
gcloud config set project grayll-system &&  gcloud projects add-iam-policy-binding grayll-system \
    --member serviceAccount:grayll-system@appspot.gserviceaccount.com \
    --role roles/datastore.importExportAdmin

bucket=grayll-system-backup

--grayll mvp:
gcloud config set project grayll-mvp &&  gcloud projects add-iam-policy-binding grayll-mvp \
    --member serviceAccount:grayll-mvp@appspot.gserviceaccount.com \
    --role roles/datastore.importExportAdmin

bucket=grayll-mvp-backup

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

# Import grayll-chart


gcloud config set project grayll-chart

gcloud projects add-iam-policy-binding grayll-chart \
    --member serviceAccount:grayll-chart@appspot.gserviceaccount.com \
    --role roles/datastore.importExportAdmin

gsutil mb gs://backup-grayll-mvp/

gsutil cp -r gs://grayll-mvp-backup/2020-09-08T02:54:04_93081/ gs://backup-grayll-mvp/ &

gcloud firestore import gs://backup-grayll-mvp/2020-09-08T02/ &