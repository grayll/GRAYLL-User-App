#!/bin/bash
ng build --prod --configuration production --aot=false --build-optimizer=false
echo $1 | sudo -S -k firebase deploy