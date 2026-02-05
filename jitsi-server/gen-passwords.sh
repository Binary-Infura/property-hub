#!/bin/bash

generatePassword() {
    openssl rand -hex 16
}

JICOFO_COMPONENT_SECRET=$(generatePassword)
JICOFO_AUTH_PASSWORD=$(generatePassword)
JVB_AUTH_PASSWORD=$(generatePassword)
JVB_COMPONENT_SECRET=$(generatePassword)

sed -i '' "s/JICOFO_COMPONENT_SECRET=.*/JICOFO_COMPONENT_SECRET=${JICOFO_COMPONENT_SECRET}/g" .env
sed -i '' "s/JICOFO_AUTH_PASSWORD=.*/JICOFO_AUTH_PASSWORD=${JICOFO_AUTH_PASSWORD}/g" .env
sed -i '' "s/JVB_AUTH_PASSWORD=.*/JVB_AUTH_PASSWORD=${JVB_AUTH_PASSWORD}/g" .env
sed -i '' "s/JVB_COMPONENT_SECRET=.*/JVB_COMPONENT_SECRET=${JVB_COMPONENT_SECRET}/g" .env

echo "Passwords generated and updated in .env"
