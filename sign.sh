#!/usr/bin/env bash

# This file is a wrapper around Adobe's ucf signing program. It can't be redistributed here, it must be downloaded at
# the following URL: http://www.adobe.com/devnet/creativesuite/sdk/eula_cs6-signing-toolkit.html
# This script assumes you installed the ucf jar in ../signingtoolkit/ucf.jar
# If you put it somewhere else, set the environment variable ADOBE_UCF_TOOLKIT_PATH to the directory where ucf.jar can
# be found
# This script also assumes your signing key is of type PKCS12 and located at ../coldwarm-ng.p12
#  - If you use a different format of signing keystore, specify COLDWARM_SIGN_STORETYPE environment variable
#  - If you need to change the path/filename to the signing keystore, specify COLDWARM_SIGN_KEYSTORE environment variable
# Packager will attempt to package the ./build dir into ./coldwarm-ng.zxp - these can be overridden with environment
# variables COLDWARM_PACKAGE_ROOT and COLDWARM_PACKAGE_FILENAME, respectively

: ${ADOBE_UCF_TOOLKIT_PATH:="../signingtoolkit"};
: ${COLDWARM_SIGN_STORETYPE:="PKCS12"};
: ${COLDWARM_SIGN_KEYSTORE:="../coldwarm-ng.p12"};
: ${COLDWARM_SIGN_TSA:="http://freetsa.org/tsr"};
: ${COLDWARM_PACKAGE_FILENAME:="./coldwarm-ng.zxp"};
: ${COLDWARM_PACKAGE_ROOT:="./build/"};

if [ ! -f "$ADOBE_UCF_TOOLKIT_PATH/ucf.jar" ]; then
  echo "ERROR: Cannot find ucf.jar in directory $ADOBE_UCF_TOOLKIT_PATH";
  exit 2;
fi

if [ ! -f "$COLDWARM_SIGN_KEYSTORE" ]; then
  echo "ERROR: $COLDWARM_SIGN_KEYSTORE does not exist or is not a valid keystore";
  exit 2;
fi

exec java -jar "$ADOBE_UCF_TOOLKIT_PATH/ucf.jar" -package \
          -storetype "$COLDWARM_SIGN_STORETYPE" \
          -keystore "$COLDWARM_SIGN_KEYSTORE" \
          -tsa "$COLDWARM_SIGN_TSA" \
          $@ \
          "$COLDWARM_PACKAGE_FILENAME" \
          -C "$COLDWARM_PACKAGE_ROOT" .
