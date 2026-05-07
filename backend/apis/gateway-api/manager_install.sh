#! /bin/bash

cd ultralution-manager-v2
npm install
npm run build
cd ..
rm -rf manager/dist
cp -r ultralution-manager-v2/dist manager/dist