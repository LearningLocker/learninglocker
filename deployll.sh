#!/bin/bash
#
# Copyright (C) 2017-2019 HT2 Labs
#
# This program is free software: you can redistribute it and/or modify it under the terms of the
# GNU General Public License as published by the Free Software Foundation, either version 3 of
# the License, or (at your option) any later version.
#
# This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without
# even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
# General Public License for more details.
#
# You should have received a copy of the GNU General Public License along with this program.
# If not, see http://www.gnu.org/licenses/.


#########################################
#           PACKING FUNCTIONS           #
#########################################
# $1 is the path to the tmp dir
function apt_package ()
{
    echo "creating apt package"
}


function yum_package ()
{
    echo "[LL] creating yum package"
}


#########################################
# GENERIC FUNCTIONS IRRESPECTIVE OF OS  #
#########################################

# simple function to symlink useful commands
function symlink_commands ()
{
    output_log "setting up symlink commands"
    alias ll-pm2-logs="su - ${LOCAL_USER} -c 'pm2 logs'"
}


function determine_os_version ()
{
    VERSION_FILE=/etc/issue.net
    REDHAT_FILE=/etc/redhat-release
    CENTOS_FILE=/etc/centos-release

    OS_SUBVER=false
    OS_VERSION=false
    OS_VNO=false

    # Make sure that the version is one we know about - if not, there'll likely be some strangeness with the package names
    if [ ! -f $VERSION_FILE ]; then
        echo "[LL] Couldn't determine version from $VERSION_FILE, file doesn't exist"
        exit 0
    fi
    RAW_OS_VERSION=$(cat $VERSION_FILE)
    if [[ $RAW_OS_VERSION == *"Amazon"* ]]; then
        OS_VERSION="Redhat"
        OS_SUBVER="Amazon"
        OS_ARCH=$(uname -a | awk '{print $12}')
        output_log "Detected OS: ${OS_VERSION}, subver:${OS_SUBVER}, arch:${OS_ARCH}, vno:${OS_VNO}, NodeOverride: ${NODE_OVERRIDE}, PM2Override:${PM2_OVERRIDE}"
    elif [[ $RAW_OS_VERSION == *"Debian"* ]]; then
        OS_VERSION="Debian"
        output_log "Detected OS: ${OS_VERSION}, subver:${OS_SUBVER}, arch:${OS_ARCH}, vno:${OS_VNO}, NodeOverride: ${NODE_OVERRIDE}, PM2Override:${PM2_OVERRIDE}"
    elif [[ $RAW_OS_VERSION == *"Ubuntu"* ]]; then
        OS_VERSION="Ubuntu"
        OS_VNO=`lsb_release -a 2>/dev/null | grep Release | awk '{print $2}'`
        if [[ $OS_VNO == "" ]]; then
            OS_VNO=$(cat /etc/os-release | grep "VERSION_ID" | sed 's?VERSION_ID=??' | sed 's?"??g')
        fi
        if [[ $OS_VNO == "14.04" ]]; then
            NODE_OVERRIDE="6.x"
            PM2_OVERRIDE="ubuntu14"
        fi
        output_log "Detected OS: ${OS_VERSION}, subver:${OS_SUBVER}, arch:${OS_ARCH}, vno:${OS_VNO}, NodeOverride: ${NODE_OVERRIDE}, PM2Override:${PM2_OVERRIDE}"
    elif [[ -f $REDHAT_FILE ]]; then
        RAW_OS_VERSION=$(cat $REDHAT_FILE)
        OS_ARCH=$(uname -a | awk '{print $12}')
        # centos detection
        if [[ $RAW_OS_VERSION == *"CentOS"* ]]; then
            OS_VNO=$(cat $CENTOS_FILE | awk '{print $4}' | tr "." " " | awk '{print $1}')
            if [[ OS_VNO < 6 ]]; then
                echo "[LL] Versions of CentOS prior to CentOS 6 aren't supported"
                exit 0
            fi
            OS_VERSION="Redhat"
            OS_SUBVER="CentOS"
            output_log "Detected OS: ${OS_VERSION}, subver:${OS_SUBVER}, arch:${OS_ARCH}, vno:${OS_VNO}, NodeOverride: ${NODE_OVERRIDE}, PM2Override:${PM2_OVERRIDE}"
        # RHEL
        elif [[ $RAW_OS_VERSION == *"Red Hat Enterprise Linux"* ]]; then
            OS_VERSION="Redhat"
            OS_SUBVER="RHEL"
            OS_VNO=$(cat $REDHAT_FILE | awk '{print $7}')
            output_log "Detected OS: ${OS_VERSION}, subver:${OS_SUBVER}, arch:${OS_ARCH}, vno:${OS_VNO}, NodeOverride: ${NODE_OVERRIDE}, PM2Override:${PM2_OVERRIDE}"
            echo
            output "Sorry, we don't support RHEL at the moment - press 'e' to exit or any other key to continue"
            read -r -s -n 1 n
            output_log "user entered ${n}"
            if [[ $n == "e" ]]; then
                exit 0
            fi
            echo

        # Fedora
        elif [[ $RAW_OS_VERSION == *"Fedora"* ]]; then
            OS_VERSION="Redhat"
            OS_SUBVER="Fedora"
            OS_VNO=$(cat $REDHAT_FILE | awk '{print $3}')
            output_log "Detected OS: ${OS_VERSION}, subver:${OS_SUBVER}, arch:${OS_ARCH}, vno:${OS_VNO}, NodeOverride: ${NODE_OVERRIDE}, PM2Override:${PM2_OVERRIDE}"
            if [[ OS_VNO < 24 ]]; then
                echo
                output "Sorry, we don't support this version of Fedora at the moment"
                echo
                exit 0
            fi

        # unknown redhat - bail
        else
            output "Only set up for debian/ubuntu/centos at the moment I'm afraid - exiting"
            exit 0
        fi
    fi

    if [[ $OS_VERSION != "Ubuntu" ]]; then
        printf "||---------------------------------------------------------------||\n"
        printf "||  -----------------------------------------------------------  ||\n"
        printf "|| NOTE: IN FUTURE, THIS INSTALL SCRIPT WILL ONLY SUPPORT UBUNTU ||\n"
        printf "||                                                               ||\n"
        printf "||          Press any key to acknowledge this message.           ||\n"
        printf "||  -----------------------------------------------------------  ||\n"
        printf "||---------------------------------------------------------------||\n"
        if [[ $BYPASSALL == false ]]; then
            read -r -s -n 1 n
        fi
        return 0
    fi

    if [[ ! $OS_VERSION ]]; then
        output "Couldn't determind version from $VERSION_FILE, unknown OS: $RAW_OS_VERSION"
        exit 0
    fi
}


function show_help ()
{
    echo "stub for help text"
    echo "CLI options:"
    echo "  -b {branch name} : specific branch to check out"
    exit 0
}


function show_install_end_text ()
{
    echo
    echo "Thanks for installing Learning Locker v2"
    echo
    echo "If you need to add a new superuser (other than one created by the install process) then you can run this command:"
    echo '    cd ${LOCAL_PATH}; node cli/dist/server createSiteAdmin "EMAIL" "ORG-NAME" "PASSWD"'
    echo " with replacing the values in capitals with ones you want"
    echo
    echo "If you need to restart the services this script has installed then you can run this command:"
    echo "    service pm2-${LOCAL_USER} restart"
    echo
}


function print_spinner ()
{
    pid=$!
    s='-\|/'
    i=0
    while kill -0 $pid 2>/dev/null; do
        i=$(( (i+1) %4 ));
        printf "\b${s:$i:1}";
        sleep .1;
    done
    printf "\b.";

    if [[ $1 == true ]]; then
        output "done!" false true
    fi
}


function output_log ()
{
    if [[ -f $OUTPUT_LOG ]]; then
        echo $1 >> $OUTPUT_LOG
    fi
}


# $1 is the message
# $2 is true/false to supress newlines
# $3 is true/false to supress the [LL] block
# $4 is the number of whitespace characters to insert before the text (not working yet)
function output ()
{
    if [[ $2 == true ]]; then
        if [[ $3 == true ]]; then
            echo -n $1
            output_log "$1"
        else
            MSG="[LL] $1"
            echo -n $MSG
            output_log "$MSG"
        fi
    else
        if [[ $3 == true ]]; then
            echo $1
            output_log "$1"
        else
            MSG="[LL] $1"
            echo $MSG
            output_log "$MSG"
        fi
    fi
}


# simple function to check if the version is greater than a specific other version
# $1 is the version to check
# $2 is the version to check against
# returns '1' if $1>=$2 or '2' otherwise
function version_check ()
{
    if [[ $1 == $2 ]]
    then
        return 1
    fi
    local IFS=.
    local i ver1=($1) ver2=($2)
    # fill empty fields in ver1 with zeros
    for ((i=${#ver1[@]}; i<${#ver2[@]}; i++))
    do
        ver1[i]=0
    done
    for ((i=0; i<${#ver1[@]}; i++))
    do
        if [[ -z ${ver2[i]} ]]
        then
            # fill empty fields in ver2 with zeros
            ver2[i]=0
        fi
        if ((10#${ver1[i]} > 10#${ver2[i]}))
        then
            return 1
        fi
        if ((10#${ver1[i]} < 10#${ver2[i]}))
        then
            return 2
        fi
    done
    return 0
}


# simple function to check if a webserver is running on this machine on port 80 (our default setup). If it it, we should warn and/or present options to the user
function webserver_check ()
{
    # first off check if we've got anything running locally
    if [[ `netstat -lnt | grep ":80 "` ]]; then
        output "You currently have a webserver running on port 80 on this server. This will need removing / resetting before our nginx config will work."
        output " If this is an upgrade of an existing install then this is nothing to worry about. Press any key to continue"
        read n
    fi
}


#################################################################################
#                            LEARNINGLOCKER FUNCTIONS                           #
#################################################################################
# $1 is the path to the install directory
# $2 is the username to run under
function setup_init_script ()
{
    if [[ ! -d $1 ]]; then
        output "path to install directory (${1}) wasn't a valid directory in setup_init_script(), exiting"
        exit 0
    fi

    if [[ ! `command -v pm2` ]]; then
        output "Didn't install pm2 or can't find it - the init script will need to be set up by hand. Press any key to continue"
        if [[ $BYPASSALL == false ]]; then
            read n
        fi
        return
    fi


    output "starting base processes...." true
    su - $2 -c "cd ${1}/${WEBAPP_SUBDIR}; pm2 start all.json"
    output "done" true true

    output "starting xapi process...." true
    su - $2 -c "cd ${1}/${XAPI_SUBDIR}; pm2 start xapi.json"
    output "done" true true

    su - $2 -c "pm2 save"
    # I'm going to apologise here for the below line - for some reason when executing the resultant command
    # from the output of pm2 startup, the system $PATH doesn't seem to be set so we have to force it to be
    # an absolute path before running the command. It also needs to go into a variable and be run rather than
    # be run within backticks or the path still isn't substituted correctly. I know, right? it's a pain.
    output "setting up PM2 startup"
    if [[ $PM2_OVERRIDE != false ]]; then
        output "using PM2 startup override of $PM2_OVERRIDE"
        PM2_STARTUP=$(su - $2 -c "pm2 startup $PM2_OVERRIDE | grep sudo | sed 's?sudo ??' | sed 's?\$PATH?$PATH?'")
    else
        PM2_STARTUP=$(su - $2 -c "pm2 startup | grep sudo | sed 's?sudo ??' | sed 's?\$PATH?$PATH?'")
    fi
    CHK=$($PM2_STARTUP)

    if [[ $OS_SUBVER == "fedora" ]]; then
        output_log "fedora detected, SELinux may get in the way"
        echo "=========================="
        echo "|         NOTICE         |"
        echo "=========================="
        echo "As you're on fedora, you may need to either turn off SELinux (not recommended) or add a rule to allow"
        echo "access to the PIDFile in /etc/systemd/system/pm2-${2}.service or the startup script will fail to run"
        echo
        echo "In addition, you'll need to punch a hole in your firewalld config or disable the firewall with:"
        echo "  service stop firewalld"
        echo
        echo
        sleep 5
    fi
}


# this function is needed to fix the lack of a CDN in the unicode-json node module. Essentially we check for a unicode
# file in a set of directories and if it doesn't exist, we create a file
# $1 is the absolute path to the unicode file we want to copy in
function unicode_definition_install ()
{
    if [[ -f /usr/share/unicode/UnicodeData.txt ]]; then
        return 0
    fi
    if [[ -f /usr/share/unicode-data/UnicodeData.txt ]]; then
        return 0
    fi
    if [[ -f /usr/share/unicode/ucd/UnicodeData.txt ]]; then
        return 0
    fi

    if [[ ! -f $1 ]]; then
        output "the path for the unicode file wasn't passed to unicode_definition_install correctly (${1})"
        sleep 5
        return 1
    fi

    mkdir -p /usr/share/unicode
    cp $1 /usr/share/unicode/UnicodeData.txt
    chmod 644 /usr/share/unicode/UnicodeData.txt
}


function base_install ()
{
    # if the checkout dir exists, prompt the user for what to do
    DEFAULT_RM_TMP=y
    DO_BASE_INSTALL=true
    if [[ -d ${WEBAPP_SUBDIR} ]]; then
        while true; do
            output "Temp directory already exists for checkout - should I delete? [y|n] (enter is the default of ${DEFAULT_RM_TMP})"
            if [[ $JUSTDOIT == true ]]; then
                output "bypass defaulting to 'y'"
                rm -R ${WEBAPP_SUBDIR}
                break
            fi
            read -r -s -n 1 n
            if [[ $n == "" ]]; then
                n=$DEFAULT_RM_TMP
            fi
            if [[ $n == "y" ]]; then
                output "Ok, deleting temp directory...." true
                rm -R ${WEBAPP_SUBDIR}
                output "done!" false true
                break
            elif [[ $n == "n" ]]; then
                output "ok, not removing it - could cause weirdness though so be warned"
                sleep 5
                DO_BASE_INSTALL=false
                break
            fi
        done
    fi

    if [[ ! `command -v git` ]]; then
        echo
        output "Can't find git - can't continue"
        echo
        exit 0
    fi

    # check if git is too far out of date
    GIT_VERSION=`git --version | awk '{print $3}'`
    MIN_GIT_VERSION="1.7.10"
    MIN_GIT_VERSION_4PT="1.7.10.0"
    output "Git version: ${GIT_VERSION}, minimum: $MIN_GIT_VERSION"
    version_check $GIT_VERSION $MIN_GIT_VERSION
    VCHK=$?
    RV=`echo $GIT_VERSION | awk -F "." '{print NF-1}'`
    if [[ $VCHK == 2 ]] && [[ $RV -gt 3 ]]; then
        # stupid double check here but pre-v2 of git had some 4-point releases which won't match the above
        version_check $GIT_VERSION $MIN_GIT_VERSION_4PT
        VCHK=$?
    fi

    if [[ $VCHK == 2 ]]; then
        output "Sorry but your version of git is too old. You should be running a minimum of $MIN_GIT_VERSION"
        exit 0
    fi

    output "Will now try and clone the git repo for the main learninglocker software. May take some time...."

    # in a while loop to capture the case where a user enters the user/pass incorrectly
    if [[ $DO_BASE_INSTALL -eq true ]]; then
        while true; do
            output_log "running git clone"
            if [[ $ENTERPRISE == true ]]; then
                MAIN_REPO=https://github.com/LearningLocker/learninglocker_node
                if [[ $GIT_USER != false ]]; then
                    MAIN_REPO=https://${GIT_USER}:${GIT_PASS}@github.com/LearningLocker/learninglocker_node
                    output_log "Cloning main repo with user: ${GIT_USER}"
                fi
            else
                MAIN_REPO=https://github.com/louismanson/learninglocker
            fi
            # clone repo
            git clone -q -b ${GIT_BRANCH} $MAIN_REPO ${WEBAPP_SUBDIR}
            # clear the history in case we passed in the user/pass
            if [[ $GIT_USER != false ]]; then
                history -c
            fi
            if [[ -d ${WEBAPP_SUBDIR} ]]; then
                output_log "no ${WEBAPP_SUBDIR} dir after git - problem"
                break
            fi
        done
    fi

    cd ${WEBAPP_SUBDIR}
    GIT_REV=`git rev-parse --verify HEAD`
    if [[ ! -f .env ]]; then
        cp .env.example .env
        if [[ $UPDATE_MODE == false ]]; then
            output "Copied example env to .env - This will need editing by hand"
        fi
        APP_SECRET=`openssl rand -base64 32`
        sed -i "s?APP_SECRET=?APP_SECRET=${APP_SECRET}?" .env
    fi

    output "checking UnicodeData is present..." true
    unicode_definition_install $PWD/UnicodeData.txt
    output "done!" false true

    # yarn install
    output "running yarn install...." true
    yarn install >> $OUTPUT_LOG 2>>$ERROR_LOG &
    print_spinner true

    # pm2 - done under npm rather than yarn as yarn does weird stuff on global installs on debian
    output "adding pm2...." true
    npm install -g pm2 >> $OUTPUT_LOG 2>>$ERROR_LOG &
    print_spinner true

    # yarn build-all
    output "running yarn build-all (this can take a little while - don't worry, it's not broken)...." true
    yarn build-all >>$OUTPUT_LOG 2>>$ERROR_LOG &
    print_spinner true

    # pm2 logrotate
    output "installing pm2 logrotate...." true
    pm2 install pm2-logrotate >> $OUTPUT_LOG 2>>$ERROR_LOG &
    print_spinner true
    output "setting up pm2 logrotate...." true
    pm2 set pm2-logrotate:compress true >> $OUTPUT_LOG 2>>$ERROR_LOG &
    print_spinner true

    # npm dedupe
    output "running npm dedupe...." true
    npm dedupe >> $OUTPUT_LOG 2>>$ERROR_LOG &
    print_spinner true
}


function xapi_install ()
{
    output "Will now try and clone the git repo for XAPI. May take some time...."
    # not checking for presence of 'git' command as done in git_clone_base()

    DO_XAPI_CHECKOUT=true;
    if [[ -d xapi ]]; then
        DEFAULT_RM_TMP="y"
        while true; do
            output "Tmp directory already exists for checkout of xapi - should I delete? [y|n] (enter is the default of ${DEFAULT_RM_TMP})"
            if [[ $JUSTDOIT == true ]]; then
                output "bypass defaulting to 'y'"
                rm -R ${XAPI_SUBDIR}
                break
            fi
            read n
            output_log "user entered '${n}'"
            if [[ $n == "" ]]; then
                n=$DEFAULT_RM_TMP
            fi
            if [[ $n == "y" ]]; then
                rm -R ${XAPI_SUBDIR}
                break
            elif [[ $n == "n" ]]; then
                output "ok, not removing it - could cause weirdness though so be warned"
                DO_XAPI_CHECKOUT=false
                sleep 5
                break
            fi
        done
    fi

    # do the checkout in a loop in case the users enters user/pass incorrectly
    if [[ $DO_XAPI_CHECKOUT -eq true ]]; then
        # TODO - make this do a max itteration of say 3 attempts to clone
        while true; do
            output_log "attempting git clone for xapi, branch: $XAPI_BRANCH"
            git clone -q -b ${XAPI_BRANCH} https://github.com/LearningLocker/xapi-service.git ${XAPI_SUBDIR}
            if [[ ! -d ${XAPI_SUBDIR} ]]; then
                output_log "git clone appears to have failed"
                break
            else
                output_log "git clone succeeded"
                break
            fi
        done
    fi

    cd ${XAPI_SUBDIR}/

    # sort out .env
    if [[ ! -f .env ]]; then
        cp .env.example .env
        if [[ $UPDATE_MODE == false ]]; then
            output "Copied example env to .env - This will need editing by hand"
        fi
    fi

    # npm
    #output "running npm install...." true
    #npm install >> $OUTPUT_LOG 2>>$ERROR_LOG &
    #print_spinner true

    #output "running npm run build...." true
    #npm run build >> $OUTPUT_LOG 2>>$ERROR_LOG &
    #print_spinner true

    # yarn
    output "running yarn install...." true
    yarn install --ignore-engines >> $OUTPUT_LOG 2>>$ERROR_LOG &
    print_spinner true

    output "running yarn build...." true
    yarn build >> $OUTPUT_LOG 2>>$ERROR_LOG &
    print_spinner true

    cd ../
}


# $1 is the file to reprocess
# $2 is the path to the install dir
# $3 is the log path - if not passed in we'll assume it's $2/logs/
# $4 is the pid path - if not passed in we'll assume it's $2/pids/
function reprocess_pm2 ()
{
    if [[ ! $1 ]]; then
        output "no file name passed to reprocess_pm2"
        return
    elif [[ ! -f $1 ]]; then
        output "file '${1}' passed to reprocess_pm2() appears to not exist."
        sleep 10
        return
    fi

    if [[ ! $2 ]]; then
        output "no install path passed to reprocess_pm2 - exiting"
        exit 0
    fi

    LOG_DIR=$2/logs
    PID_DIR=$2/pids
    if [[ $3 ]]; then
        LOG_DIR=$3
    fi
    if [[ $4 ]]; then
        PID_DIR=$4
    fi

    output_log "pm2 - setting pid dir to $PID_DIR"
    output_log "pm2 - setting install path to $2"
    output_log "pm2 - setting log dir to $LOG_DIR"

    sed -i "s?{INSTALL_DIR}?${2}?g" $1
    sed -i "s?{LOG_DIR}?${LOG_DIR}?g" $1
    sed -i "s?{PID_DIR}?${PID_DIR}?g" $1
}


# central method to read variables from the .env and overwrite into the nginx config
# $1 is the nginx config
# $2 is the .env to over-write
# $3 is the xapi .env
# $4 is the path to the install - typically this should be the path to the symlink directory rather than the release dir
function setup_nginx_config ()
{
    output "Setting up nginx config"
    if [[ ! -f $1 ]]; then
        output "Warning :: nginx config in $1 can't be found - will need to be edited manually. Press any key to continue"
        if [[ $BYPASSALL == false ]]; then
            read -r -s -n 1 n
        fi
        return 0
    fi

    if [[ ! -f $2 ]]; then
        output "Warning :: .env in $2 can't be found, can't set up nginx config correctly - will need to be edited manually. Press any key to continue"
        if [[ $BYPASSALL == false ]]; then
            read -r -s -n 1 n
        fi
        return 0
    fi

    if [[ ! -f $3 ]]; then
        output "Warning :: xapi .env in $3 can't be found, can't set up nginx config correctly - will need to be edited manually. Press any key to continue"
        if [[ $BYPASSALL == false ]]; then
            read -r -s -n 1 n
        fi
        return 0
    fi

    UI_PORT=`egrep '^UI_PORT(\s)?=' $2 | tail -1 | sed -r 's/UI_PORT(\s)?=(\s)?//' | sed 's/\r//' `
    API_PORT=`egrep '^API_PORT(\s)?=' $2 | tail -1 | sed -r 's/API_PORT(\s)?=(\s)?//' | sed 's/\r//' `
    XAPI_PORT=`egrep '^EXPRESS_PORT(\s)?=' $3 | tail -1 | sed -r 's/EXPRESS_PORT(\s)?=(\s)?//' | sed 's/\r//' `

    output_log "nginx - setting ui port to $UI_PORT"
    output_log "nginx - setting api port to $API_PORT"
    output_log "nginx - setting xapi port to $XAPI_PORT"
    output_log "nginx - setting site root to $4"

    sed -i "s/UI_PORT/${UI_PORT}/" $1
    sed -i "s/:API_PORT/:${API_PORT}/" $1
    sed -i "s/XAPI_PORT/${XAPI_PORT}/" $1
    sed -i "s?/SITE_ROOT?${4}?" $1
}

# $1 is the path to the nginx config file
# $2 is the path to the install dir (symlink dir)
function setup_nginx_enterprise ()
{
    output "Running nginx enterprise setup"

    if [[ ! -f $1 ]]; then
        output "Warning :: nginx config in $1 can't be found - will need to be edited manually. Press any key to continue"
        if [[ $BYPASSALL == false ]]; then
            read -r -s -n 1 n
        fi
        return 0
    fi

    output_log "nginx - setting site root to $2"
    sed -i "s?/SITE_ROOT?${2}?" $1
}


function find_clam_config ()
{
    CLAMD_CONFIG=/etc/clamd.conf
    if [[ -f /etc/clamav/clamd.conf ]]; then
        CLAMD_CONFIG=/etc/clamav/clamd.conf
    fi
}



#################################################################################
#                           DEBIAN / UBUNTU FUNCTIONS                           #
#################################################################################
function debian_install ()
{
    export DEBIAN_FRONTEND=noninteractive

    # debian & ubuntu have a package called cmdtest which we need to uninstall as it'll conflict with yarn
    apt-get remove cmdtest >> $OUTPUT_LOG 2>>$ERROR_LOG &

    # we run an apt-get update here in case the distro is out of date
    if [[ ! `command -v python` ]] || [[ ! `command -v curl` ]] || [[ ! `command -v wget` ]] || [[ ! `command -v git` ]] || [[ ! `command -v gcc` ]] || [[ ! `command -v g++` ]]; then
        apt-get update >> $OUTPUT_LOG 2>>$ERROR_LOG
        apt-get -y -qq install net-tools curl wget git python build-essential xvfb apt-transport-https >> $OUTPUT_LOG 2>>$ERROR_LOG
    fi

    if [[ ! `command -v pwgen ` ]]; then
        if [[ $AUTOSETUPUSER == true ]]; then
            apt-get -y -qq install pwgen
        fi
    fi

    if [[ ! `command -v python` ]]; then
        if [[ `command -v python3` ]]; then
            output "Symlinking python3 to python for Yarn"
            ln -s `command -v python3` /usr/bin/python
        else
            output "Something seems to have gone wrong in installing basic software, can't find python or python3 - exiting"
            exit 0
        fi
    fi

    INSTALL_NODE=false
    if [[ ! `command -v nodejs` ]]; then
        INSTALL_NODE=true
        output_log "installing nodejs"
    elif [[ `nodejs --version | cut -d'.' -f 1` != $NODE_VERSION_STRING ]]; then
        INSTALL_NODE=true
        output_log "updating nodejs"
    else
        CUR_NODE_VERSION=`nodejs --version | cut -d'.' -f 1`
        output_log "current node version is found as ${CUR_NODE_VERSION}"
    fi

    if [[ $INSTALL_NODE == true ]]; then
        curl -sL https://deb.nodesource.com/setup_${NODE_VERSION} | bash - >> $OUTPUT_LOG 2>>$ERROR_LOG
        apt-get -y -qq install nodejs >> $OUTPUT_LOG 2>>$ERROR_LOG
    else
        output "Node.js already installed"
    fi


    if [[ `nodejs --version | cut -d'.' -f 1` != $NODE_VERSION_STRING ]]; then
        output "Something went wrong in installing/updating nodejs. This is likely a fault in your apt config. Can't continue"
        exit 0
    fi


    INSTALLED_NODE_VERSION=`nodejs --version`
    if [[ $INSTALLED_NODE_VERSION == "" ]]; then
        INSTALLED_NODE_VERSION=`node --version`
        if [[ $INSTALLED_NODE_VERSION == "" ]]; then
            output "ERROR :: node doesn't seem to be installed - exiting"
            exit 1
        fi
    fi
    output "node version - $INSTALLED_NODE_VERSION"

    if [[ ! `command -v yarn` ]]; then
        curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - >> $OUTPUT_LOG 2>>$ERROR_LOG
        echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
        apt-get -qq update >> $OUTPUT_LOG 2>>$ERROR_LOG
        apt-get -y -qq install yarn >> $OUTPUT_LOG 2>>$ERROR_LOG
    else
        output "yarn already installed"
    fi
}

# $1 is temp path to the webapp subdir
# $2 is the symlink path to the webappsubdir
#
function debian_nginx ()
{
    if [[ ! -d $1 ]]; then
        output "No temp directory passed to debian_nginx() '${1}', should be impossible - exiting"
        exit 0
    fi

    while true; do
        output "The next part of the install process will install nginx and remove any default configs - press 'y' to continue or 'n' to abort (press 'enter' for the default of 'y')"
        if [[ $BYPASSALL == true ]]; then
            output "bypassing to 'y'"
            break
        fi
        read -r -s -n 1 n
        output_log "user entered '${n}'"
        if [[ $n == "" ]]; then
            n="y"
        fi
        if [[ $n == "y" ]]; then
            break
        elif [[ $n == "n" ]]; then
            output "Can't continue - you'll need to do this step by hand"
            sleep 5
            return
        fi
    done

    output "installing nginx..."
    output "Setting up nginx repo (Stock Ubuntu version is too old)"
    cd /tmp/ && wget http://nginx.org/keys/nginx_signing.key >> $OUTPUT_LOG 2>>$ERROR_LOG && cd - >> $OUTPUT_LOG 2>>$ERROR_LOG 
    apt-key add /tmp/nginx_signing.key >> $OUTPUT_LOG 2>>$ERROR_LOG
    echo "deb https://nginx.org/packages/ubuntu/ $(lsb_release -cs) nginx" | tee /etc/apt/sources.list.d/Nginx.list >> $OUTPUT_LOG 2>>$ERROR_LOG
    apt update >> $OUTPUT_LOG 2>>$ERROR_LOG
    apt -qq -y install nginx >> $OUTPUT_LOG 2>>$ERROR_LOG
    print_spinner true

    if [[ ! -f ${1}/nginx.conf.example ]]; then
        output "default learninglocker nginx config doesn't exist - can't continue. Press any key to continue"
        if [[ $BYPASSALL == false ]]; then
            read n
        fi
        return
    fi


    NGINX_CONFIG=/etc/nginx/conf.d/learninglocker.conf
    XAPI_ENV=${PWD}/${XAPI_SUBDIR}/.env
    BASE_ENV=${PWD}/${WEBAPP_SUBDIR}/.env
    # remove default config if it exists
    if [[ -f /etc/nginx/conf.d/default.conf ]]; then
        rm /etc/nginx/conf.d/default.conf
    fi
    mv ${1}/nginx.conf.example $NGINX_CONFIG
    # sub in variables from the .envs to the nginx config
    if [[ $ENTERPRISE == true ]]; then
        setup_nginx_enterprise $NGINX_CONFIG $2
    else
        setup_nginx_config $NGINX_CONFIG $BASE_ENV $XAPI_ENV $2
        service nginx restart
    fi
}


function debian_mongo ()
{
    D_M_I=false
    if [[ $OS_VERSION == "Ubuntu" ]]; then
        if [[ $OS_VNO == "16.04" ]]; then
            output "Setting up mongo repo (Stock Ubuntu version is too old)"
            apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 0C49F3730359A14518585931BC711F9BA15703C6 >> $OUTPUT_LOG 2>>$ERROR_LOG
            echo "deb [ arch=amd64,arm64 ] http://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/3.4 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-3.4.list
            apt-get update >> $OUTPUT_LOG 2>>$ERROR_LOG
            systemctl unmask mongod
            apt-get -qq -y install mongodb-org >> $OUTPUT_LOG 2>>$ERROR_LOG
            # Attempt to start via both services - one will likely fail but
            output "Attempting to start mongod service...."
            output "If this fails you will need to check how the Mongo service is setup for your system and manually start it"
            service mongod start
            systemctl enable mongod.service
            D_M_I=true
        fi
    fi

    if [[ $D_M_I == false ]]; then
        output "installing mongodb...." true
        apt-get -y -qq install mongodb >> $OUTPUT_LOG 2>>$ERROR_LOG &
        print_spinner true
    fi
}


function debian_redis ()
{
    output "installing redis...." true
    apt-get -y -qq install redis-tools redis-server >> $OUTPUT_LOG 2>>$ERROR_LOG &
    print_spinner true
}


function debian_clamav ()
{
    output "Installing ClamAV...." true
    apt-get -y -qq install clamav clamav-daemon >> $OUTPUT_LOG 2>>$ERROR_LOG &
    print_spinner true
    CLAM_INSTALLED=true
}


#################################################################################
#                                REDHAT FUNCTIONS                               #
#################################################################################
REDHAT_EPEL_INSTALLED=false
function redhat_epel ()
{
    if [[ $REDHAT_EPEL_INSTALLED == true ]]; then
        return
    fi
    output "setting up EPEL repository...." true
    yum -y install epel-release >> $OUTPUT_LOG 2>>$ERROR_LOG &
    print_spinner true
    REDHAT_EPEL_INSTALLED=true
}


function redhat_redis ()
{
    output "installing redis"
    redhat_epel
    yum -y install redis >> $OUTPUT_LOG 2>>$ERROR_LOG
    service redis start >> $OUTPUT_LOG 2>>$ERROR_LOG
}


function redhat_mongo ()
{
    redhat_epel

    mkdir -p /data/db

    output "installing mongodb....." true
    yum -y install mongodb-server >> $OUTPUT_LOG 2>>$ERROR_LOG &
    print_spinner true

    output "setting semanage on mongodb....." true
    semanage port -a -t mongod_port_t -p tcp 27017 >> $OUTPUT_LOG 2>>$ERROR_LOG
    output "done" true true

    output "starting mongodb...." true
    service mongod start >> $OUTPUT_LOG 2>>$ERROR_LOG &
    print_spinner true
}


function redhat_clamav ()
{
    output "Installing ClamAV...." true
    yum -y install clamav >> $OUTPUT_LOG 2>>$ERROR_LOG &
    print_spinner true
    CLAM_INSTALLED=true
}


function redhat_install ()
{
    output "installing base software...." true
    yum -y install curl wget git python make automake gcc gcc-c++ kernel-devel xorg-x11-server-Xvfb git-core >> $OUTPUT_LOG 2>>$ERROR_LOG &
    print_spinner true

    if [[ ! `command -v pwmake` ]]; then
        if [[ $OS_VERSION == Amazon ]]; then
            yum -y install passwd >> $OUTPUT_LOG 2>>$ERROR_LOG
        elif [[ ! `command -v pwgen ` ]]; then
            if [[ $AUTOSETUPUSER == true ]]; then
                yum -y install pwgen >> $OUTPUT_LOG 2>>$ERROR_LOG
            fi
        fi
    fi

    INSTALL_NODE=false
    if [[ ! `command -v nodejs` ]]; then
        output_log "installing node"
        INSTALL_NODE=true
    elif [[ `nodejs --version | cut -d'.' -f 1` != $NODE_VERSION_STRING ]]; then
        output_log "updating node"
        INSTALL_NODE=true
    else
        CUR_NODE_VERSION=`nodejs --version | cut -d'.' -f 1`
        output_log "current node version is found as ${CUR_NODE_VERSION}"
    fi

    if [[ $INSTALL_NODE == true ]]; then
        output "setting up nodejs repo...." true
        curl --silent --location https://rpm.nodesource.com/setup_${NODE_VERSION} | bash - >> $OUTPUT_LOG 2>>$ERROR_LOG &
        print_spinner true
        output "installing nodejs...." true
        yum -y install nodejs >> $OUTPUT_LOG 2>>$ERROR_LOG &
        print_spinner true
    else
        output "Node.js already installed"
    fi

    INSTALLED_NODE_VERSION=`nodejs --version`
    if [[ $INSTALLED_NODE_VERSION == "" ]]; then
        INSTALLED_NODE_VERSION=`node --version`
        if [[ $INSTALLED_NODE_VERSION == "" ]]; then
            output "ERROR :: node doesn't seem to be installed - exiting"
            exit 1
        fi
    fi
    output "node version - $INSTALLED_NODE_VERSION"

    if [[ ! `command -v yarn` ]]; then
        output "setting up yarn repo...." true
        wget https://dl.yarnpkg.com/rpm/yarn.repo -O /etc/yum.repos.d/yarn.repo >> $OUTPUT_LOG 2>>$ERROR_LOG &
        print_spinner true
        output "installing yarn...." true
        yum -y install yarn >> $OUTPUT_LOG 2>>$ERROR_LOG &
        print_spinner true
    else
        output "yarn already installed"
    fi
}


function redhat_nginx ()
{
    if [[ ! -d $1 ]]; then
        output "No temp directory passed to centos_nginx(), should be impossible - exiting"
        exit 0
    fi

    while true; do
        output "The next part of the install process will install nginx and remove any default configs - press 'y' to continue or 'n' to abort (press 'enter' for the default of 'y')"
        if [[ $BYPASSALL == true ]]; then
            output "bypass defaulting to 'y'"
            break
        fi
        read -r -s -n 1 n
        output_log "user pressed '${n}'"
        if [[ $n == "" ]]; then
            n="y"
        fi
        if [[ $n == "y" ]]; then
            break
        elif [[ $n == "n" ]]; then
            output "Can't continue - you'll need to do this step by hand"
            sleep 5
            return
        fi
    done

    output "installing nginx...."
    yum -y install nginx >> $OUTPUT_LOG 2>>$ERROR_LOG &
    print_spinner true

    # remove default config if it exists
    if [[ -f /etc/nginx/conf.d/default.conf ]]; then
        rm /etc/nginx/conf.d/default.conf
    fi

    if [[ $OS_SUBVER == "Fedora" ]]; then
        output "Default fedora nginx config needs the server block in /etc/nginx/nginx.conf removing"
        output "before learninglocker will work properly or it'll clash with the LL config" false false 5
        output "Press any key to continue" false false 5
        if [[ $BYPASSALL == false ]]; then
            read n
        fi
    fi


    if [[ ! -f ${1}/nginx.conf.example ]]; then
        output "default learninglocker nginx config doesn't exist - can't continue. Press any key to continue"
        if [[ $BYPASSALL == false ]]; then
            read n
        fi
        return
    fi


    if [[ ! -d /etc/nginx/conf.d ]]; then
        mkdir -p /etc/nginx/conf.d
    fi
    NGINX_CONFIG=/etc/nginx/conf.d/learninglocker.conf
    XAPI_ENV=${PWD}/${XAPI_SUBDIR}/.env
    BASE_ENV=${PWD}/${WEBAPP_SUBDIR}/.env
    mv ${1}/nginx.conf.example $NGINX_CONFIG
    # sub in variables from the .envs to the nginx config
    setup_nginx_config $NGINX_CONFIG $BASE_ENV $XAPI_ENV $2
    restorecon -v $NGINX_CONFIG


    if [[ $OS_SUBVER == "CentOS" ]] || [[ $OS_SUBVER == "Fedora" ]]; then
        output "I need to punch a hole in selinux to continue. This is running the command:"
        output "setsebool -P httpd_can_network_connect 1" false false 5
        output "press 'y' to continue or 'n' to exit" false false 5
        while true; do
            if [[ $BYPASSALL == true ]]; then
                output "bypass defaulting to 'y'"
                setsebool -P httpd_can_network_connect 1
                break
            fi
            read n
            if [[ $n == "n" ]]; then
                echo "not doing this, you'll have to run it by hand"
                sleep 5
                break
            elif [[ $n == "y" ]]; then
                setsebool -P httpd_can_network_connect 1
                break
            fi
        done
    fi


    service nginx restart

    if [[ $OS_SUBVER == "CentOS" ]]; then
        output "as you're on CentOS, this may be running with firewalld enabled - you'll either need to punch"
        output "a hole in the firewall rules or disable firewalld (not recommended) to allow inbound access to" false false 5
        output "learning locker. Press any key to continue" false false 5
        if [[ $BYPASSALL == false ]]; then
            read n
        fi
    fi
}


#################################################################################
#                                CENTOS FUNCTIONS                               #
#################################################################################


#################################################################################
#                                AMAZON FUNCTIONS                               #
#################################################################################
function amazon_mongo ()
{
    MONGO_REPO_FILE=/etc/yum.repos.d/mongodb-org-3.4.repo

    output "setting up mongo repo in $MONGO_REPO_FILE"

    echo "[mongodb-org-3.4]" > $MONGO_REPO_FILE
    echo "name=MongoDB Repository" >> $MONGO_REPO_FILE
    echo "baseurl=https://repo.mongodb.org/yum/amazon/2013.03/mongodb-org/3.4/x86_64/" >> $MONGO_REPO_FILE
    echo "gpgcheck=1" >> $MONGO_REPO_FILE
    echo "enabled=1" >> $MONGO_REPO_FILE
    echo "gpgkey=https://www.mongodb.org/static/pgp/server-3.4.asc" >> $MONGO_REPO_FILE

    output "installing mongodb...." true
    yum -y install mongodb-org >> $OUTPUT_LOG 2>>$ERROR_LOG &
    print_spinner true
}


#################################################################################
#                                FEDORA FUNCTIONS                               #
#################################################################################
function fedora_redis ()
{
    output "installing redis"
    yum install redis >> $OUTPUT_LOG 2>>$ERROR_LOG
}


function fedora_mongo ()
{
    output "installing mongodb"
    yum -y install mongodb-server >> $OUTPUT_LOG 2>>$ERROR_LOG
}


#################################################################################
#################################################################################
#################################################################################
#                                                                               #
#                                END OF FUNCTIONS                               #
#                                                                               #
#################################################################################
#################################################################################
#################################################################################

# before anything, make sure the tmp dir is large enough of get the user to specify a new one
_TD=/tmp
MIN_DISK_SPACE=3000000

# check we have enough space available
FREESPACE=`df $_TD | awk '/[0-9]%/{print $(NF-2)}'`
if [[ $FREESPACE -lt $MIN_DISK_SPACE ]]; then
    echo "[LL] your temp dir isn't large enough to continue, please enter a new path (pressing enter will exit)"
    while true; do
        if [[ $BYPASSALL == false ]]; then
            output "In bypass mode - can't continue"
            exit 0
        fi
        read n
        if [[ $n == "" ]]; then
            exit 0
        elif [[ ! -d $n ]]; then
            echo "[LL] Sorry but the directory '${n}' doesn't exist - please enter a valid one (press enter to exit)"
        else
            _TD=$n
            break
        fi
    done
fi



#################################################################################
#                                DEFAULT VALUES                                 #
#################################################################################
UPI=false
LOCAL_INSTALL=false
PACKAGE_INSTALL=false
DEFAULT_USER=learninglocker
DEFAULT_SYMLINK_PATH=/usr/local/learninglocker/current
DEFAULT_LOCAL_RELEASE_PATH=/usr/local/learninglocker/releases
DEFAULT_PID_PATH=/var/run
DEFAULT_INSTALL_TYPE=l
LOCAL_PATH=false
LOCAL_USER=false
TMPDIR=$_TD/.tmpdist
GIT_BRANCH="master"
GIT_USER=false
GIT_PASS=false
XAPI_BRANCH="master"
MIN_REDIS_VERSION="2.8.11"
MIN_MONGO_VERSION="3.0.0"
BUILDDIR="${_TD}/learninglocker"
MONGO_INSTALLED=false
REDIS_INSTALLED=false
PM2_OVERRIDE=false
NODE_OVERRIDE=false
NODE_VERSION=8.x
NODE_VERSION_STRING=v8
UPDATE_MODE=false
GIT_ASK=false
GIT_REV=false
RELEASE_PATH=false
SYMLINK_PATH=false
MIN_MEMORY=970
LOG_PATH=/var/log/learninglocker
OUTPUT_LOG=${LOG_PATH}/install.log
CLAM_INSTALL=false
CLAM_PATH=false
WEBAPP_SUBDIR="webapp"
XAPI_SUBDIR="xapi"
ERROR_LOG=$OUTPUT_LOG   # placeholder - only want one file for now, may be changed later
JUSTDOIT=false          # variable set from CLI via the -y flag to just say yes to all the defaults
BYPASSALL=false         # if -y is set to '2' then we bypass any and all questions
AUTOSETUPUSER=false     # if -y is set to '3' then we also automatically run through the user setup if we have to
WRITE_AUTOSETUP=false   # if -y is set to '4' then we will write to the output file (bottom of the script) for the auto generated credentials
SETUP_AMI=false         # if -y is set to '5' then we bypass all questions, don't set up user but do clone out the deploy repo and prep for an AMI setup
ENTERPRISE=false        # if true then do things specific to enterprise (ie: don't set up mongo or redis).
                        # this is designed to be mostly the same as the OS model so search for this variable to see differences
                        # Can be set with '-e 1' as a command line param - you'll need to have github access to the private repos for it to work
ENTERPRISE_IGNORE_STARTUP=false
FORCE_MONGO_NOINSTALL=false
FORCE_REDIS_NOINSTALL=false


#################################################################################
#                                 START CHECKS                                  #
#################################################################################

# cleanup, just in case
if [ -d $TMPDIR ]; then
    rm -R $TMPDIR
fi

if [ -d "${BUILDDIR}" ]; then
    echo "clearing old tmp dir"
    rm -R ${BUILDDIR}
fi

if [ -d $TMPDIR ]; then
    output "tmp directory from prior install (${TMPDIR}) still exists - please clear by hand"
    exit 0
fi

# check if root user
if [[ `whoami` != "root" ]]; then
    output "Sorry, you need to be root to run this script (currently normal user)"
    exit 0
fi
if [[ $EUID > 0 ]]; then
    # THIS EUID check checks if we're sudo - I don't want the script to run a sudo for the time being
    output "Sorry, you need to be root to run this script (currently sudo)"
    exit 0
fi

if [[ ! `command -v openssl` ]]; then
    output "Sorry but you need openssl installed to install"
    exit 0
fi

# check system memory (in MB)
SYSTEM_MEMORY=$(free -m | awk '/^Mem/' | awk '{print $2}')
if [[ $SYSTEM_MEMORY -lt $MIN_MEMORY ]]; then
    output "You need a minimum of ${MIN_MEMORY}Mb of system memory to install Learning Locker - can't continue"
    exit 0
fi

# logging
if [[ ! -d $LOG_PATH ]]; then
    mkdir -p $LOG_PATH
fi
if [[ -f $OUTPUT_LOG ]]; then
    rm $OUTPUT_LOG
    touch $OUTPUT_LOG
fi


#################################################################################
#                                 GET USER INPUT                                #
#################################################################################
OPTIND=1         # Reset in case getopts has been used previously in the shell.

while getopts ":h:y:b:x:e:m:r:u:p:" OPT; do
    case "$OPT" in
        h)
            show_help
        ;;
        y)
            JUSTDOIT=true
            if [[ $OPTARG == "2" ]]; then
                BYPASSALL=true
            elif [[ $OPTARG == "3" ]]; then
                BYPASSALL=true
                AUTOSETUPUSER=true
            elif [[ $OPTARG == "4" ]]; then
                BYPASSALL=true
                AUTOSETUPUSER=true
                WRITE_AUTOSETUP=true
            elif [[ $OPTARG == "5" ]]; then
                BYPASSALL=true
                SETUP_AMI=true
            fi
        ;;
        b)
            GIT_BRANCH=$OPTARG
        ;;
        x)
            XAPI_BRANCH=$OPTARG
        ;;
        e)
            if [[ $OPTARG == "1" ]]; then
                ENTERPRISE=true
            elif [[ $OPTARG == "2" ]]; then
                ENTERPRISE_IGNORE_STARTUP=true
                ENTERPRISE=true
            fi
        ;;
        m)
            if [[ $OPTARG == "1" ]]; then
                FORCE_MONGO_NOINSTALL=true
            fi
        ;;
        r)
            if [[ $OPTARG == "1" ]]; then
                FORCE_REDIS_NOINSTALL=true
            fi
        ;;
        u)
            if [[ -n $OPTARG ]]; then
                GIT_USER=$OPTARG
            fi
        ;;
        p)
            if [[ -n $OPTARG ]]; then
                GIT_PASS=$OPTARG
            fi
        ;;
    esac
done



#################################################################################
#                                 ASK QUESTIONS                                 #
#################################################################################
if [[ $GIT_ASK == true ]]; then
    while true; do
        output "What branch do you want to install? Press 'enter' for the default of ${GIT_BRANCH}"
        read -r n
        if [[ $n == "" ]]; then
            output_log "user didn't select a branch"
            break
        else
            while true; do
                output "are you sure the branch '${n}' is correct? [y|n] (press enter for the default of 'y')"
                read -r -s -n 1 c
                if [[ $c == "" ]]; then
                    c="y"
                fi
                output_log "user entered '${c}'"
                if [[ $c == "y" ]] || [[ $c == "Y" ]]; then
                    GIT_BRANCH=$n
                    break 2
                elif [[ $c == "n" ]]; then
                    break
                fi
            done
        fi
    done
fi

while true; do
    #echo "[LL] Do you want to install this locally(l) or create a package(p)? [l|p] (enter for default of '${DEFAULT_INSTALL_TYPE}'"
    #read -r -s -n 1 n
    n="l"
    if [[ $n == "" ]]; then
        n=$DEFAULT_INSTALL_TYPE
    fi
    if [[ $n == "l" ]]; then
        output_log "NOTE :: Local install selected"
        LOCAL_INSTALL=true
        break
    elif [[ $n == "p" ]]; then
        output_log "NOTE :: Package install selected"
        PACKAGE_INSTALL=true
        break
    fi
done


#######################################################################
#                       LOCAL INSTALL QUESTIONS                       #
#######################################################################
while true; do
    # entering a while loop here so that if we're on a just do it type of install then we can skip out of the loop rather than
    # having a bunch of if's everywhere

    if [[ $LOCAL_INSTALL == true ]]; then

        webserver_check

        #######################################################################
        #                        AUTOMATED LOCAL SETUP                        #
        #######################################################################
        if [[ $JUSTDOIT == true ]]; then
            RELEASE_PATH=$DEFAULT_LOCAL_RELEASE_PATH
            SYMLINK_PATH=$DEFAULT_SYMLINK_PATH
            # user
            LOCAL_USER=$DEFAULT_USER
            USERDATA=`getent passwd $LOCAL_USER`
            if [[ $USERDATA != *"$LOCAL_USER"* ]]; then
                useradd -r -d $RELEASE_PATH $LOCAL_USER
                if [[ ! -d $RELEASE_PATH ]]; then
                    mkdir -p $RELEASE_PATH
                fi
                chown ${u}:${u} $RELEASE_PATH
            fi
            # symlink
            if [[ -f $SYMLINK_PATH ]] && [[ ! -L $SYMLINK_PATH ]]; then
                output "This path appears to already exist and be a regular file rather than a symlink - Can't continue"
                exit 0
            elif [[ -L $SYMLINK_PATH ]]; then
                output "In update mode"
                UPDATE_MODE=true
            fi
            # mongo
            if [[ `command -v mongod` ]]; then
                output "MongoDB is already installed, not installing"
                CUR_MONGO_VERSION=`mongod --version | grep "db version" | sed "s?db version v??"`
                output_log "mongo version currently installed: $CUR_MONGO_VERSION"
                version_check $CUR_MONGO_VERSION $MIN_MONGO_VERSION
                MONGOCHK=$?
                if [[ $MONGOCHK == 2 ]]; then
                    output "Warning:: this version of mongo (${CUR_MONGO_VERSION}) is below the minimum requirement of ${MIN_MONGO_VERSION} - you'll need to update this yourself"
                    sleep 5
                else
                    MONGO_INSTALLED=true
                fi
            else
                MONGO_INSTALL=true
                MONGO_INSTALLED=true
            fi
            # redis
            if [[ `command -v redis-server` ]]; then
                output "Redis is already installed, not installing"
                CUR_REDIS_VERSION=`redis-server --version | awk '{print $3}' | sed 's/v=//'`
                output_log "Redis Version: $CUR_REDIS_VERSION"
                version_check $CUR_REDIS_VERSION $MIN_REDIS_VERSION
                REDISCHK=$?
                if [[ $REDISCHK == 2 ]]; then
                    output "Warning:: this version of redis (${CUR_REDIS_VERSION}) is below the minimum requirement of ${MIN_REDIS_VERSION} - you'll need to update this yourself"
                    sleep 5
                else
                    REDIS_INSTALLED=true
                fi
            else
                REDIS_INSTALL=true
                REDIS_INSTALLED=true
            fi
            if [[ $FORCE_MONGO_NOINSTALL == true ]]; then
                output "forcing no mongo install"
                MONGO_INSTALL=false
            fi
            if [[ $FORCE_REDIS_NOINSTALL == true ]]; then
                output "forcing no redis install"
                REDIS_INSTALL=false
            fi

            output "automated setup"
            output "release path: $RELEASE_PATH"
            output "symlink path: $SYMLINK_PATH"
            output "user: $LOCAL_USER"
            # clamav
            if [[ `command -v clamdscan` ]]; then
                output "ClamAV already installed"
                CLAM_PATH=`command -v clamdscan`
                CLAM_INSTALLED=true
            else
                CLAM_INSTALL=true
            fi

            break
        fi


        #######################################################################
        #                        IN-PERSON LOCAL SETUP                        #
        #######################################################################
        output " We require a path to install to and a path to symlink to. The reason for this is that the script can be re-run in order to update"
        output "     cleanly. The path we'll ask you for is a base path for the releases to be installed to so if you select the default of:" false true
        output "         $DEFAULT_LOCAL_RELEASE_PATH" false true
        output "     then we will create a sub-directory under here for every release and symlink the latest install to the final install path (which" false true
        output "     the nginx config points at. This is so that roll-backs can be done easier and we can perform a complete install before finally" false true
        output "     switching the nginx config over which'll minimise downtime on upgrades" false true
        while true; do
            output "What base directory do you want to install to? (Press 'enter' for the default of $DEFAULT_LOCAL_RELEASE_PATH)"
            read -r p
            if [[ $p == "" ]]; then
                p=$DEFAULT_LOCAL_RELEASE_PATH
            fi
            output_log "attempting to use base path of: $DEFAULT_LOCAL_RELEASE_PATH"
            if [[ ! -d $p ]]; then
                while true; do
                    output "Directory '${p}' doesn't exist - should we create it? [y|n] (Press enter for default of 'y')"
                    read -r -s -n 1 c
                    if [[ $c == "" ]] || [[ $c == "y" ]]; then
                        output_log "user opted to proceed"
                        mkdir -p $p
                        if [[ ! -d $p ]]; then
                            output "ERROR : Tried to create directory $p and couldn't, exiting"
                            exit 0
                        fi
                        RELEASE_PATH=$p
                        break 2
                    elif [[ $c == n ]]; then
                        output "ERROR : Can't continue without creating releases directory, exiting"
                        exit 0
                    fi
                done
            else
                RELEASE_PATH=$p
                break
            fi
        done

        # check where to symlink to
        while true; do
            output "What path should the release be symlinked to? (Press enter for the default of $DEFAULT_SYMLINK_PATH)"
            read -r p
            if [[ $p == "" ]]; then
                p=$DEFAULT_SYMLINK_PATH
            fi
            SYMLINK_PATH=$p
            output_log "attempting to use path of: $SYMLINK_PATH"
            if [[ -f $SYMLINK_PATH ]] && [[ ! -L $SYMLINK_PATH ]]; then
                output "This path appears to already exist and be a regular file rather than a symlink - Can't continue"
                exit 0
            elif [[ -L $SYMLINK_PATH ]]; then
                # symlink exists, go into update mode
                output "It looks like this symlink already exists - do you want to upgrade an existing install? [y|n|e] (Press enter for the default of 'y', 'n' to install regardless ignoring the prior release or 'e' to exit)"
                while true; do
                    read -r -s -n 1 c
                    if [[ $c == "e" ]]; then
                        output "Ok, exiting"
                        exit 0
                    fi
                    if [[ $c == "y" ]] || [[ $c == "" ]]; then
                        output_log "user pressed '${c}'"
                        output_log "NOTE :: RUNNING IN UPDATE MODE FROM NOW ON"
                        UPDATE_MODE=true
                        break 2
                    elif [[ $c == n ]]; then
                        while true; do
                            output "Ok, do you want to continue to install anyway? If you select yes then we'll unlink/delete things as needed [y|n] (Press enter for the default of 'y')"
                            read -r -s -n 1 b
                            if [[ $b == "y" ]] || [[ $b == "" ]]; then
                                output "Ok, continuing on - you won't be prompted for any overrides"
                                break 3
                            elif [[ $b == "n" ]]; then
                                output "Ok, I can't continue - you'll need to complete the install manually"
                                exit 0
                            fi
                        done
                    fi
                done
            else
                # no file currently present - bog standard normal install
                break
            fi
        done


        # determine user to install under
        while true; do
            output "I need a user to install the code under - what user would you like me to use? (press enter for the default of '$DEFAULT_USER')"
            read -r u
            if [[ $u == "" ]]; then
                u=$DEFAULT_USER
            fi
            USERDATA=`getent passwd $u`
            if [[ $USERDATA == *"$u"* ]]; then
                # user exists
                while true; do
                    output "User '$u' already exists - are you sure you want to continue? [y|n] (enter for default of 'y')"
                    read -r -s -n 1 c
                    if [[ $c == "" ]]; then
                        c="y"
                    fi
                    if [[ $c == "y" ]]; then
                        output_log "continuing using this user"
                        LOCAL_USER=$u
                        break
                    elif [[ $c == "n" ]]; then
                        output "Selected to not continue, exiting"
                        exit 0
                    fi
                done
            else
                while true; do
                    output "User '$u' doesn't exist - do you want me to create them? [y|n] (enter for default of 'y')"
                    read -r -s -n 1 c
                    if [[ $c == "" ]]; then
                        c="y"
                    fi
                    if [[ $c == "y" ]]; then
                        output "Creating user '${u}'...." true
                        useradd -r -d $RELEASE_PATH $u
                        if [[ ! -d $RELEASE_PATH ]]; then
                            mkdir -p $RELEASE_PATH
                        fi
                        chown ${u}:${u} $RELEASE_PATH
                        output "done!" false true
                        LOCAL_USER=$u
                        break
                    elif [[ $c == "n" ]]; then
                        output "Can't create user - can't continue"
                        exit 0
                    fi
                done
            fi
            break
        done


        # check mongo
        if [[ $FORCE_MONGO_NOINSTALL == true ]]; then
            MONGO_INSTALL=false
            output_log "forcing not installing mongodb"
        elif [[ `command -v mongod` ]]; then
            output "MongoDB is already installed, not installing"
            CUR_MONGO_VERSION=`mongod --version | grep "db version" | sed "s?db version v??"`
            output_log "mongo version currently installed: $CUR_MONGO_VERSION"
            version_check $CUR_MONGO_VERSION $MIN_MONGO_VERSION
            MONGOCHK=$?
            output_log "mongo check is $MONGOCHK"
            if [[ $MONGOCHK == 2 ]]; then
                output "Warning:: this version of mongo (${CUR_MONGO_VERSION}) is below the minimum requirement of ${MIN_MONGO_VERSION} - you'll need to update this yourself"
                sleep 5
            else
                output "Mongo version (${CUR_MONGO_VERSION}) is above minimum of $MIN_MONGO_VERSION - continuing"
                MONGO_INSTALLED=true
            fi
        else
            while true; do
                output "MongoDB isn't installed - do you want to install it? [y|n] (press 'enter' for default of 'y')"
                read -r -s -n 1 c
                if [[ $c == "" ]]; then
                    c="y"
                fi
                if [[ $c == "y" ]]; then
                    output_log "opted to install mongo"
                    MONGO_INSTALL=true
                    MONGO_INSTALLED=true
                    break
                elif [[ $c == "n" ]]; then
                    output_log "opted not to install mongo"
                    MONGO_INSTALL=false
                    break
                fi
            done
        fi

        # check redis
        if [[ $FORCE_REDIS_INSTALL == false ]]; then
            REDIS_INSTALL=false
            output_log "forcing not installing redis"
        elif [[ `command -v redis-server` ]]; then
            output "Redis is already installed, not installing"
            CUR_REDIS_VERSION=`redis-server --version | awk '{print $3}' | sed 's/v=//'`
            output_log "Redis Version: $CUR_REDIS_VERSION"
            version_check $CUR_REDIS_VERSION $MIN_REDIS_VERSION
            REDISCHK=$?
            if [[ $REDISCHK == 2 ]]; then
                output "Warning:: this version of redis (${CUR_REDIS_VERSION}) is below the minimum requirement of ${MIN_REDIS_VERSION} - you'll need to update this yourself"
                sleep 5
            else
                output "Redis version (${CUR_REDIS_VERSION}) is above minimum of $MIN_REDIS_VERSION - continuing"
                REDIS_INSTALLED=true
            fi
        else
            while true; do
                output "Redis isn't installed - do you want to install it? [y|n] (press 'enter' for default of 'y')"
                read -r -s -n 1 c
                if [[ $c == "" ]]; then
                    c="y"
                fi
                if [[ $c == "y" ]]; then
                    output_log "opted to install redis"
                    REDIS_INSTALL=true
                    REDIS_INSTALLED=true
                    break
                elif [[ $c == "n" ]]; then
                    output_log "opted not to install redis"
                    REDIS_INSTALL=false
                    break
                fi
            done
        fi


        # check for clamAV
        if [[ `command -v clamdscan` ]]; then
            output "ClamAV already installed"
            CLAM_PATH=`command -v clamdscan`
            CLAM_INSTALLED=true
        else
            CLAM_INSTALLED=false
            while true; do
                output "Learning Locker ideally works best with ClamAV (anti virus software) installed but it is not an absolute requirement. Do you want to install it? [y|n] (press 'enter' for the default of 'y')"
                read -r -s -n 1 c
                output_log "user entered '${c}'"
                if [[ $c == "" ]]; then
                    c="y"
                fi
                if [[ $c == "y" ]]; then
                    CLAM_INSTALL=true
                    break
                elif [[ $c == "n" ]]; then
                    CLAM_INSTALL=false
                    break
                fi
            done
        fi
    fi
    break
done

#######################################################################
#                      PACKAGE INSTALL QUESTIONS                      #
#######################################################################
if [[ $PACKAGE_INSTALL == true ]]; then
    echo "PACKAGE QUESTIONS GO HERE"
fi


#################################################################################
#                          RUN BASE INSTALL TO TMPDIR                           #
#################################################################################
determine_os_version

if [[ $NODE_OVERRIDE != false ]]; then
    NODE_VERSION=$NODE_OVERRIDE
fi
output "Installing node version: $NODE_VERSION"

if [[ $OS_VERSION == "Debian" ]]; then
    debian_install
elif [[ $OS_VERSION == "Ubuntu" ]]; then
    debian_install
elif [[ $OS_VERSION == "Redhat" ]]; then
    redhat_install
fi


# make sure dirs exist
if [[ ! -d $BUILDDIR ]]; then
    mkdir -p $BUILDDIR
fi

# base install & build
output "Running install steps"
cd $BUILDDIR
base_install

cd $BUILDDIR
xapi_install

# create tmp dir
output "creating $TMPDIR"
if [[ ! -d $TMPDIR ]]; then
    mkdir -p $TMPDIR
fi
if [[ ! -d ${TMPDIR}/${WEBAPP_SUBDIR}/ ]]; then
    mkdir -p ${TMPDIR}/${WEBAPP_SUBDIR}
fi
if [[ ! -d ${TMPDIR}/${XAPI_SUBDIR}/ ]]; then
    mkdir -p ${TMPDIR}/${XAPI_SUBDIR}
fi

# package.json
output "copying modules...." true
if [[ ! -f ${BUILDDIR}/${WEBAPP_SUBDIR}/package.json ]]; then
    output "can't copy file '${BUILDDIR}/${WEBAPP_SUBDIR}/package.json' as it doesn't exist- exiting" false true
    exit 0
fi
cp ${BUILDDIR}/${WEBAPP_SUBDIR}/package.json ${TMPDIR}/${WEBAPP_SUBDIR}/

# pm2 loader
if [[ ! -f ${BUILDDIR}/${WEBAPP_SUBDIR}/pm2/all.json ]]; then
    output "can't copy file '${BUILDDIR}/${WEBAPP_SUBDIR}/pm2/all.json' as it doesn't exist- exiting" false true
    exit 0
fi

# xapi config
if [[ ! -f ${BUILDDIR}/${XAPI_SUBDIR}/pm2/xapi.json.dist ]]; then
    output "can't copy file '${BUILDDIR}/${XAPI_SUBDIR}/pm2/xapi.json.dist' as it doesn't exist- exiting" false true
    exit 0
fi
if [[ ! -d ${TMPDIR}/${XAPI_SUBDIR} ]]; then
    mkdir -p ${TMPDIR}/${XAPI_SUBDIR}
fi

# node_modules
if [[ ! -d ${BUILDDIR}/${WEBAPP_SUBDIR}/node_modules ]]; then
    output "can't copy directory '${BUILDDIR}/${WEBAPP_SUBDIR}/node_modules' as it doesn't exist- exiting" false true
    exit 0
fi
cp -R ${BUILDDIR}/${WEBAPP_SUBDIR}/node_modules $TMPDIR/${WEBAPP_SUBDIR}/ >> $OUTPUT_LOG 2>>$ERROR_LOG &
print_spinner true


# copy the files
if [[ $ENTERPRISE == true ]]; then
    output "Copying enterprise pm2 configs"
    cp ${BUILDDIR}/${WEBAPP_SUBDIR}/pm2/worker.json.dist ${TMPDIR}/${WEBAPP_SUBDIR}/worker.json
    cp ${BUILDDIR}/${WEBAPP_SUBDIR}/pm2/webapp.json.dist ${TMPDIR}/${WEBAPP_SUBDIR}/webapp.json
    cp ${BUILDDIR}/${XAPI_SUBDIR}/pm2/xapi.json.dist $TMPDIR/${XAPI_SUBDIR}/xapi.json
else
    output "Copying pm2 configs"
    cp ${BUILDDIR}/${WEBAPP_SUBDIR}/pm2/all.json.dist ${TMPDIR}/${WEBAPP_SUBDIR}/all.json
    cp ${BUILDDIR}/${XAPI_SUBDIR}/pm2/xapi.json.dist $TMPDIR/${XAPI_SUBDIR}/xapi.json
fi

output_log "copying nginx.conf.example to $TMPDIR"
cp ${BUILDDIR}/${WEBAPP_SUBDIR}/nginx.conf.example $TMPDIR/${WEBAPP_SUBDIR}/

output_log "copying ${BUILDDIR}/${WEBAPP_SUBDIR}/.git to $TMPDIR"
cp -R ${BUILDDIR}/${WEBAPP_SUBDIR}/.git $TMPDIR/${WEBAPP_SUBDIR}/

output_log "copying ${BUILDDIR}/${WEBAPP_SUBDIR}/.env to $TMPDIR"
cp ${BUILDDIR}/${WEBAPP_SUBDIR}/.env $TMPDIR/${WEBAPP_SUBDIR}/

output_log "copying ${BUILDDIR}/${XAPI_SUBDIR}/.env to $TMPDIR/${XAPI_SUBDIR}/"
cp ${BUILDDIR}/${XAPI_SUBDIR}/.env $TMPDIR/${XAPI_SUBDIR}/

# full copy of remaining files
output "copying files (may take some time)...." true
cp -Rp $BUILDDIR/* $TMPDIR/
output "done!" false true


DATESTRING=`date +%Y%m%d`
LOCAL_PATH=${RELEASE_PATH}/ll-${DATESTRING}-${GIT_REV}


### ENTERPRISE config
if [[ $ENTERPRISE == true ]]; then
    REDIS_INSTALLED=false
    MONGO_INSTALLED=false
    REDIS_INSTALL=false
    MONGO_INSTALL=false
    AUTOSETUPUSER=false
fi


if [[ $LOCAL_INSTALL == true ]] && [[ $UPDATE_MODE == false ]]; then
    #################################################################################
    #                                 LOCAL INSTALL                                 #
    #################################################################################

    # check for the existance of the release path. If it doesn't exist, create it and chown it.
    # this is because a user could've rm -rf'd the directory after useradd had created it
    if [[ ! -d $RELEASE_PATH ]]; then
        mkdir -p $RELEASE_PATH
        chown $LOCAL_USER:$LOCAL_USER -R $RELEASE_PATH
    else
        DIR_USER=`ls -l $RELEASE_PATH | awk '{print $3}'`
        if [[ $DIR_USER != $LOCAL_USER ]]; then
            chown $LOCAL_USER:$LOCAL_USER -R $RELEASE_PATH
        fi
    fi

    # UBUNTU & DEBIAN
    if [[ $OS_VERSION == "Ubuntu" ]] || [[ $OS_VERSION == "Debian" ]]; then
        debian_nginx ${TMPDIR}/${WEBAPP_SUBDIR} $SYMLINK_PATH/${WEBAPP_SUBDIR}
        if [[ $REDIS_INSTALL == true ]]; then
            debian_redis
        fi
        if [[ $MONGO_INSTALL == true ]]; then
            debian_mongo
        fi
        if [[ $CLAM_INSTALL == true ]]; then
            debian_clamav
        fi
    elif [[ $OS_VERSION == "Redhat" ]]; then
        # BASE REDHAT stuff
        redhat_nginx ${TMPDIR}/${WEBAPP_SUBDIR} $SYMLINK_PATH/${WEBAPP_SUBDIR}
        if [[ $CLAM_INSTALL == true ]]; then
            redhat_clamav
        fi
    # FEDORA
        if [[ $OS_SUBVER == "Fedora" ]]; then
            if [[ $REDIS_INSTALL == true ]]; then
                fedora_redis
            fi
            if [[ $MONGO_INSTALL == true ]]; then
                fedora_mongo
            fi
    # AMAZON
        elif [[ $OS_SUBVER == "Amazon" ]]; then
            if [[ $REDIS_INSTALL == true ]]; then
                output "AWS Linux doesn't ship with Redis in a repository. You'll need to install this yourself. Press any key to continue"
                REDIS_INSTALL=false
                REDIS_INSTALLED=false
                read -n 1 n
                if [[ $MONGO_INSTALL == true ]]; then
                    while true; do
                        if [[ $BYPASSALL == true ]]; then
                            output "BYPASS - installing mongo even without redis present"
                            break
                        fi
                        output "As redis isn't going to be installed locally, do you still want to install MongoDB? [y|n] (press enter for the default of 'y')"
                        read -s -r -n 1 n
                        output_log "user entered '${n}'"
                        if [[ $n == "n" ]]; then
                            MONGO_INSTALL=false
                            break
                        elif [[ $n == "y" ]]; then
                            MONGO_INSTALL=true
                            break
                        fi
                    done
                fi
            fi
            if [[ $MONGO_INSTALL == true ]]; then
                amazon_mongo
                read n
            fi
        else
    # RHEL / GENERIC REDHAT & CENTOS (nothing specific required for centos)
            if [[ $REDIS_INSTALL == true ]]; then
                redhat_redis
            fi
            if [[ $MONGO_INSTALL == true ]]; then
                redhat_mongo
            fi
        fi
    fi

    # get the clamAV path if needed
    if [[ $CLAM_INSTALL == true ]]; then
        CLAM_PATH=`command -v clamdscan`
    fi


    output "Local install to $LOCAL_PATH"


    # check redis installed to the right version
    # if not, then we'll act like we haven't installed it
    if [[ $REDIS_INSTALL == true ]]; then
        if [[ ! `command -v redis-server` ]]; then
            output "Warning :: Can't find the redis-server executable, this means it's not been installed when it looks like it should've been. Press any key to continue"
            REDIS_INSTALLED=false
            if [[ $BYPASSALL == false ]]; then
                read -n 1 n
            fi
        else
            CUR_REDIS_VERSION=`redis-server --version | awk '{print $3}' | sed 's/v=//'`
            version_check $CUR_REDIS_VERSION $MIN_REDIS_VERSION
            output_log "redis version: $CUR_REDIS_VERSION"
            REDISCHK=$?
            if [[ $REDISCHK == 2 ]]; then
                output "Warning:: this version of redis (${CUR_REDIS_VERSION}) is below the minimum requirement of ${MIN_REDIS_VERSION} - you'll need to update this yourself - Press any key to continue"
                REDIS_INSTALLED=false
                if [[ $BYPASSALL == false ]]; then
                    read -n 1 n
                fi
            fi
        fi
    fi

    # extra warning for redis not being installed locally
    if [[ $REDIS_INSTALLED == false ]]; then
        output " Learning Locker requires Redis to be installed. As this isn't available on this server you'll need to"
        output "     change the variables in ${LOCAL_PATH}/.env to point to a redis server. The variables you'll need to" false true
        output "     change are 'REDIS_HOST', 'REDIS_PORT', 'REDIS_DB' and possibly 'REDIS_PREFIX'" false true
        echo
        if [[ $OS_SUBVER == "Amazon" ]]; then
            output "As you're running on AWS then you can use 'ElastiCache' to get a Redis instance set up quickly. We can't install"
            output "     Redis on AWS EC2 instances at the moment as there are no official repositories for a copy of Redis. If you want" false true
            output "     to install Redis on this server then we'd recommend you grab the latest version from:" false true
            output "         https://redis.io/download" false true
            output "     and follow the install steps on this page" false true
            echo
        fi
        if [[ $BYPASSALL == false ]]; then
            output "Press any key to continue" false true
            read -n 1 n
        fi
        echo
    elif [[ $REDIS_INSTALL == false ]] && [[ $REDIS_INSTALLED == true ]] && [[ $ENTERPRISE == false ]]; then
        # only hit this bit if redis was installed already
        output "Redis appears to have already been installed on this server. By default, Redis doesn't have a huge amount"
        output "     of security enabled and as such, the default Learning Locker config is set up to use the local copy of Redis" false true
        output "     with the default lack of credentials. If you want to secure Redis more or want to connect to a different" false true
        output "     Redis server then you'll need to edit the redis variables:" false true
        output "         'REDIS_HOST', 'REDIS_PORT', 'REDIS_DB' and maybe'REDIS_PREFIX'" false true
        output "     in ${LOCAL_PATH}/.env" false true
        echo
        if [[ $BYPASSALL == false ]]; then
            output "Press any key to continue" false true
            read -n 1 n
        fi
        echo
    fi

    # extra warning for mongodb
    if [[ $MONGO_INSTALLED == false ]]; then
        output "Learning Locker requires MongoDB to be installed. As this isn't installed locally on this server you'll"
        output "     need to change the variable in ${LOCAL_PATH}/.env to point to a MongoDB Server. The variable you'll" false true
        output "     have to change is 'MONGODB_PATH'" false true
        echo
        if [[ $BYPASSALL == false ]]; then
            output "Press any key to continue" false true
            read -n 1 n
        fi
        echo
    elif [[ $MONGO_INSTALL == false ]] && [[ $MONGO_INSTALLED == true ]] && [[ $ENTERPRISE == false ]]; then
        # only hit this bit if mongo was installed already
        output "MongoDB appears to have already been installed on this server. By default, MongoDB doesn't have a huge amount"
        output "     of security enabled and as such, the default Learning Locker config is set up to use the local copy of MongoDB" false true
        output "     with the default lack of credentials. If you want to secure MongoDB more or want to connect to a different" false true
        output "     MongoDB server then you'll need to edit the 'MONGODB_PATH' variable in ${LOCAL_PATH}/.env" false true
        echo
        if [[ $BYPASSALL == false ]]; then
            output "Press any key to continue" false true
            read -n 1 n
        fi
        echo
    fi


    # set up the pid & log directories
    PID_PATH=$DEFAULT_PID_PATH
    if [[ $LL_PID_PATH != "" ]]; then
        PID_PATH=$LL_PID_PATH
        if [[ ! -d $PID_PATH ]]; then
            mkdir -p $PID_PATH
            chown $LOCAL_USER:$LOCAL_USER $PID_PATH -R
        fi
    fi

    chown -R ${LOCAL_USER}:${LOCAL_USER} $LOG_PATH


    if [[ $ENTERPRISE != true ]]; then
        output_log "reprocessing $TMPDIR/${WEBAPP_SUBDIR}/all.json"
        reprocess_pm2 $TMPDIR/${WEBAPP_SUBDIR}/all.json $SYMLINK_PATH/${WEBAPP_SUBDIR} $LOG_PATH $PID_PATH
        output_log "reprocessing $TMPDIR/${XAPI_SUBDIR}/xapi.json"
        reprocess_pm2 $TMPDIR/${XAPI_SUBDIR}/xapi.json ${SYMLINK_PATH}/${XAPI_SUBDIR} $LOG_PATH $PID_PATH
    else
        output "reprocessing enterprise files"
        reprocess_pm2 $TMPDIR/${WEBAPP_SUBDIR}/webapp.json $SYMLINK_PATH/${WEBAPP_SUBDIR} $LOG_PATH $PID_PATH
        reprocess_pm2 $TMPDIR/${WEBAPP_SUBDIR}/worker.json $SYMLINK_PATH/${WEBAPP_SUBDIR} $LOG_PATH $PID_PATH
        reprocess_pm2 $TMPDIR/${XAPI_SUBDIR}/xapi.json ${SYMLINK_PATH}/${XAPI_SUBDIR} $LOG_PATH $PID_PATH
    fi


    mkdir -p $LOCAL_PATH
    cp -R $TMPDIR/* $LOCAL_PATH/
    # above line doesn't copy the 'dot' files so have to do this manually
    cp $TMPDIR/${WEBAPP_SUBDIR}/.env $LOCAL_PATH/${WEBAPP_SUBDIR}/.env
    cp -R $TMPDIR/${WEBAPP_SUBDIR}/.git $LOCAL_PATH/${WEBAPP_SUBDIR}/.git
    chown $LOCAL_USER:$LOCAL_USER $LOCAL_PATH -R

    # update the .env with the path to clamav
    if [[ $CLAM_INSTALLED == true ]]; then
        sed -i "s?#CLAMDSCAN_BINARY=/usr/bin/clamscan?CLAMSCAN_BINARY=${CLAM_PATH}?" $LOCAL_PATH/${WEBAPP_SUBDIR}/.env
        find_clam_config
        sed -i "s?#CLAMDSCAN_CONF=/etc/clamav/clamd.conf?CLAMSCAN_BINARY=${CLAMD_CONFIG}?" $LOCAL_PATH/${WEBAPP_SUBDIR}/.env
    fi

    # set up symlink
    if [[ -f $SYMLINK_PATH ]]; then
        output_log "un-linking symlink of $SYMLINK_PATH"
        unlink $SYMLINK_PATH
    fi
    output_log "creating symlink : $LOCAL_PATH $SYMLINK_PATH"
    ln -s $LOCAL_PATH $SYMLINK_PATH


    # set up init script and run any reprocessing we need
    if [[ $ENTERPRISE != true ]]; then
        output_log "setting up init script. Path: $LOCAL_PATH user: $LOCAL_USER"
        setup_init_script $LOCAL_PATH $LOCAL_USER
        service pm2-${LOCAL_USER} start
    fi


    if [ $MONGO_INSTALLED == true ] && [ $REDIS_INSTALLED == true ] && [ $SETUP_AMI == false ]; then
        RUN_INSTALL_CMD=false
        output "do you want to set up the organisation now to complete the installation? [y|n] (press enter for the default of 'y')"
        while true; do
            if [[ $AUTOSETUPUSER == true ]]; then
                output "Automatic setup detected"
                INSTALL_EMAIL="ht2testadmin@ht2labs.com"
                INSTALL_ORG="testOrg"
                if [[ `command -v pwgen` ]]; then
                    INSTALL_PASSWD=`pwgen 8 1`
                elif [[ `command -v pwmake` ]]; then
                    INSTALL_PASSWD=`pwmake 64`
                else
                    INSTALL_PASSWD="ChangeMeN0w"
                fi
                RUN_INSTALL_CMD=true
                break
            fi

            read -r -s -n 1 n
            output_log "user entered '${n}'"
            if [[ $n == "" ]]; then
                n="y"
            fi
            if [[ $n == "y" ]]; then
                while true; do
                    output "please enter the organisation name"
                    read e
                    output_log "user entered '${e}'"
                    if [[ $e != "" ]]; then
                        INSTALL_ORG=$e
                        break
                    fi
                done
                while true; do
                    output "please enter the email address for the administrator account"
                        read e
                    output_log "user entered '${e}'"
                    if [[ $e != "" ]]; then
                        INSTALL_EMAIL=$e
                        break
                    fi
                done
                while true; do
                    while true; do
                        output "please enter the password for the administrator account"
                        read -r -s e
                        if [[ $e != "" ]]; then
                            INSTALL_PASSWD=$e
                            break
                        fi
                    done
                    while true; do
                        output "please confirm the password for the administrator account"
                        read -r -s e
                        if [[ $e != "" ]]; then
                            if [[ $e == $INSTALL_PASSWD ]]; then
                                output_log "user entered passwords that matched - not writing them to the log for obvious reasons"
                                break 2
                            else
                                output "Sorry, passwords don't match. Please try again."
                                sleep 1
                                break
                            fi
                        fi
                    done
                done
                while true; do
                    echo
                    output "Is the following information correct?"
                    output "  Organisation  : $INSTALL_ORG"
                    output "  Email address : $INSTALL_EMAIL"
                    output "[y|n]"
                    read -r -s -n 1 e
                    if [[ $e == "y" ]]; then
                        break;
                    elif [[ $e == "n" ]]; then
                        continue 2
                    fi
                done

                RUN_INSTALL_CMD=true
                break;
            elif [[ $n == "n" ]]; then
                break;
            fi
        done

        if [[ $RUN_INSTALL_CMD == true ]]; then
            d=`pwd`
            cd ${LOCAL_PATH}/${WEBAPP_SUBDIR}
            output "Attempting to create your site admin. If this step fails, then it is possible Mongo has not started."
            output "Attempt to manually start the Mongo service and then run this command:"
            output "cd ${LOCAL_PATH}; node cli/dist/server createSiteAdmin YOUR.EMAIL@ADDRESS.COM ORGANISATION_NAME YOUR_PASSWORD"

            node cli/dist/server createSiteAdmin "$INSTALL_EMAIL" "$INSTALL_ORG" "$INSTALL_PASSWD"
            cd $d
        fi

    else
        echo
        if [[ $MONGO_INSTALLED == true ]]; then
            output "Mongo: Installed"
        else
            output "Mongo: Not Installed"
        fi
        if [[ $REDIS_INSTALLED == true ]]; then
            output "Redis: Installed"
        else
            output "Redis: Not Installed"
        fi
        echo
        output "Everything is installed but either mongoDB and/or Redis are missing from the local installation. Please edit the .env file"
        output "in $LOCAL_PATH to point to your relevant servers then run this command:"
        output "  cd ${LOCAL_PATH}; node cli/dist/server createSiteAdmin {your.email@address.com} {organisationName} {yourPassword}"
        echo
    fi

    symlink_commands

    show_install_end_text

elif [[ $LOCAL_INSTALL == true ]] && [[ $UPDATE_MODE == true ]]; then
    #################################################################################
    #                         UPGRADE FROM EXISTING INSTALL                         #
    #################################################################################

    if [[ -d $LOCAL_PATH ]]; then
        output "the release directory in $LOCAL_PATH already exists - creating a new directory"
        i=0
        POSSIBLE_PATH=$LOCAL_PATH
        while true; do
            i=$((i + 1))
            POSSIBLE_PATH=${LOCAL_PATH}_${i}
            if [[ ! -d $POSSIBLE_PATH ]]; then
                LOCAL_PATH=$POSSIBLE_PATH
                output "Created release directory: $LOCAL_PATH"
                break
            fi
            if [[ $i -gt 20 ]]; then
                output "more than 20 installs today - this looks like something has gone wrong, exiting"
                exit 0
            fi
        done
    fi

    # copy to correct local dir
    mkdir -p $LOCAL_PATH
    cp -R $TMPDIR/* $LOCAL_PATH/

    # block to determine directory format as it's changed/changing
    COPYFROMPATH=${SYMLINK_PATH}/${WEBAPP_SUBDIR}
    FORCEFULLRESTART=false
    if [[ -f ${SYMLINK_PATH}/.env ]]; then
        COPYFROMPATH=${SYMLINK_PATH}
        FORCEFULLRESTART=true
    fi


    # copy the .env from the existing install over to the new path
    output "Copying existing config to new version"
    cp ${COPYFROMPATH}/.env ${LOCAL_PATH}/${WEBAPP_SUBDIR}/.env
    cp ${SYMLINK_PATH}/${XAPI_SUBDIR}/.env ${LOCAL_PATH}/${XAPI_SUBDIR}/.env

    # copy the existing .git over
    if [[ -d ${COPYFROMPATH}/.git ]]; then
        cp -R ${COPYFROMPATH}/.git ${LOCAL_PATH}/${WEBAPP_SUBDIR}/
    fi

    # copy the pm2 files from existing install over
    cp ${COPYFROMPATH}/all.json ${LOCAL_PATH}/${WEBAPP_SUBDIR}/all.json
    cp ${SYMLINK_PATH}/${XAPI_SUBDIR}/xapi.json ${LOCAL_PATH}/${XAPI_SUBDIR}/xapi.json

    # as we're upgrading the install, we need to re-jig the all.json to reflect the new paths
    if [[ $FORCEFULLRESTART == true ]]; then
        sed -i "s?$SYMLINK_PATH?${SYMLINK_PATH}/${WEBAPP_SUBDIR}?" ${LOCAL_PATH}/${WEBAPP_SUBDIR}/all.json
    fi

    # copy anything in the storage dirs over
    output "Copying user uploaded data in storage/ folders to new install....." true
    cp -nR ${COPYFROMPATH}/storage/* ${LOCAL_PATH}/${WEBAPP_SUBDIR}/storage/
    if [[ ! -d ${LOCAL_PATH}/${XAPI_SUBDIR}/storage ]]; then
        mkdir -p ${LOCAL_PATH}/${XAPI_SUBDIR}/storage
    fi
    cp -nR ${SYMLINK_PATH}/${XAPI_SUBDIR}/storage/* ${LOCAL_PATH}/${XAPI_SUBDIR}/storage/
    output "done!" false true

    chown $LOCAL_USER:$LOCAL_USER $LOCAL_PATH -R


    # prompt user that we're about to do the swap over
    UPDATE_RESTART=false
    UPDATE_RELOAD=false
    echo "[LL] As we're upgrading, we need to do a few bits of switching over. This carries a risk of downtime so you have two options now"
    echo "     you can select a reload (r) or a complete restart (c). A complete restart will stop running services before starting new ones"
    echo "     whereas a reload will attempt to reload with minimal downtime but runs more of a risk of not being totally clean. If you do"
    echo "     experience any strange effects you should be able to run:"
    echo "         'service pm2-${LOCAL_USER} restart'"
    echo "         'service nginx restart'"
    echo "     which'll cause the system to be completely restarted. [r|c] (Press enter for the default of 'c')"
    echo "     Please note: There's a risk of downtime from the moment you select an option"
    while true; do
        if [[ $JUSTDOIT == true ]]; then
            output "defaulting to full restart on update"
            UPDATE_RESTART=true
            break
        fi
        if [[ $FORCEFULLRESTART == true ]]; then
            output "Forcing full restart due to change in directory structure on update"
            UPDATE_RESTART=true
            break
        fi
        read -r -s -n 1 t
        #t=c
        if [[ $t == "" ]] || [[ $t == c ]]; then
            UPDATE_RESTART=true
            break
        elif [[ $t == "r" ]]; then
            UPDATE_RELOAD=true
            break
        fi
    done

    # complete restart
    if [[ $UPDATE_RESTART == true ]]; then
        PM2_PATH=`command -v pm2`

        echo "[LL] Ok, performing a complete restart"
        echo
        echo "[LL] Stopping nginx...."
        service nginx stop
        echo "[LL] Stopping pm2 processes...."
        service pm2-${LOCAL_USER} stop
        echo "[LL] re-symlinking directory...."
        unlink $SYMLINK_PATH
        ln -s $LOCAL_PATH $SYMLINK_PATH
        echo "[LL] starting PM2 processes...."
        su - ${LOCAL_USER} -c "cd ${LOCAL_PATH}/${WEBAPP_SUBDIR}; $PM2_PATH start all.json"
        su - ${LOCAL_USER} -c "cd ${LOCAL_PATH}/${XAPI_SUBDIR}; $PM2_PATH start xapi.json"
        su - ${LOCAL_USER} -c "$PM2_PATH save"
        service pm2-${LOCAL_USER} restart
        echo "[LL] PM2 processes restarted"
        echo "[LL] restarting nginx...."
        service nginx start
    fi

    # reload only
    if [[ $UPDATE_RELOAD == true ]]; then
        echo "[LL] Ok, reloading...."

        echo "[LL] re-symlinking directory...."
        unlink $SYMLINK_PATH
        ln -s $LOCAL_PATH $SYMLINK_PATH

        echo "[LL] reloading nginx"
        service nginx reload

        echo "[LL] reloading pm2"
        service pm2-${LOCAL_USER} reload
    fi


    # migration logic
    DONE_MIGRATIONS=false
    echo "[LL] We are going to check if there are any migrations that need to be run. This can take some time to run and can be run manually by running"
    echo "     'cd ${LOCAL_PATH}/${WEBAPP_SUBDIR} && yarn migrate'"
    echo "     If you don't have a valid config yet please skip this step. Do you want to run migrations ? [y|n] (press enter for default of 'y')"
    while true; do
        read -r -s -n 1 c
        if [[ $c == "y" ]] || [[ $c == "Y" ]] || [[ $c == "" ]]; then
            output "running yarn migrate...."
            cd ${LOCAL_PATH}/${WEBAPP_SUBDIR}
            yarn migrate
            output "done!"
            DONE_MIGRATIONS=true
            break
        elif [[ $c == "n" ]] || [[ $c == "N" ]]; then
            break
        fi
    done


elif [[ $PACKAGE_INSTALL == true ]]; then
    #################################################################################
    #                                PACKAGE INSTALL                                #
    #################################################################################
    echo "[LL] Package install"



    # APT
    if [[ $OS_VERSION == "Debian" ]] || [[ $OS_VERSION == "Ubuntu" ]]; then
        apt_package $TMPDIR
    elif [[ $OS_VERSION == "Redhat" ]]; then
    # Yum
        yum_package $TMPDIR
    fi



else
    echo "[LL] Got to a point which should be impossible - not in a package or local install"
fi



#################################################################################
#                                    CLEANUP                                    #
#################################################################################
echo "[LL] cleaning up temp directories"
if [[ -d $TMPDIR ]]; then
    rm -R $TMPDIR
fi
if [[ -d ${BUILDDIR}/${WEBAPP_SUBDIR} ]]; then
    rm -R ${BUILDDIR}/${WEBAPP_SUBDIR}
fi


if [[ $AUTOSETUPUSER == true ]] && [[ $UPDATE_MODE == false ]]; then
    echo
    output "Auto-setup an account with following details:"
    output " email    : $INSTALL_EMAIL"
    output " org      : $INSTALL_ORG"
    output " password : $INSTALL_PASSWD"
    echo
    echo
fi


if [[ $WRITE_AUTOSETUP == true ]] && [[ $UPDATE_MODE == false ]]; then
    output_file=/usr/local/learninglocker/ll_credentials.txt
    echo "email    : $INSTALL_EMAIL" > $output_file
    echo "org      : $INSTALL_ORG" >> $output_file
    echo "password : $INSTALL_PASSWD" >> $output_file
fi

# generic AMI stuff for both OS and enterprise
if [[ $SETUP_AMI == true ]]; then
    output "Cloning out deploy git repo to tmp to seed AMI building"
    cd /tmp
    if [[ ! -d /etc/learninglocker ]]; then
        mkdir -p /etc/learninglocker
    fi
    # check required dirs
    if [[ -d /tmp/deploy ]]; then
        rm -R /tmp/deploy
    fi
    # git clone
    git clone https://github.com/LearningLocker/deploy deploy
fi


# Enterprise AMI specific stuff
if [[ $SETUP_AMI == true ]] && [[ $ENTERPRISE == true ]]; then
    # check required dirs
    #if [[ -d /tmp/devops ]]; then
    #    rm -R /tmp/devops
    #fi

    output "Installing awscli & mongo/redis tools...." true
    apt-get -y -qq install awscli redis-tools mongodb-clients >> $OUTPUT_LOG 2>>$ERROR_LOG &
    print_spinner true

    while true; do
        DEVOPS_REPO=https://github.com/LearningLocker/devops

        if [[ $GIT_USER != false ]]; then
            DEVOPS_REPO=https://${GIT_USER}:${GIT_PASS}@github.com/LearningLocker/devops
            output_log "Cloning devops repo with user: ${GIT_USER}"
        fi
        git clone $DEVOPS_REPO /tmp/devops
        if [[ $GIT_USER != false ]]; then
            history -c
        fi
        if [[ ! -d devops ]]; then
            output_log "no devops dir after git - problem"
        else
            break
        fi
    done
    cd /tmp/devops

    if [[ $ENTERPRISE_IGNORE_STARTUP == false ]]; then
        output "setting up env-fetch script"
        cp startup_env_fetch.sh /usr/sbin/ll_startup_env_fetch.sh
        chmod 755 /usr/sbin/ll_startup_env_fetch.sh
        cp startup_env_fetch.service /lib/systemd/system/ll_startup_env_fetch.service
        systemctl enable ll_startup_env_fetch

        # tweak nginx loader to load after the new startup script
        output "setting nginx to require the env fetch first"
        sed -i "s/After=/Requires=ll_startup_env_fetch.service\nAfter=/g" /lib/systemd/system/nginx.service
        systemctl daemon-reload
    fi

    # load in the aws logs stuff
    if [[ -f /tmp/devops/awslogs/awslogs.conf ]]; then
        # figure out the current AWS region
        EC2_AVAIL_ZONE=`curl -s http://169.254.169.254/latest/meta-data/placement/availability-zone`
        REGION="`echo \"$EC2_AVAIL_ZONE\" | sed -e 's:\([0-9][0-9]*\)[a-z]*\$:\\1:'`"
        output "determined aws region to be '${REGION}'"

        # install awslogs
        cd /tmp

        output "Installing required tools for cloudwatch...." true
        apt-get install -y -qq libyaml-dev python-dev python-pip >> $OUTPUT_LOG 2>>$ERROR_LOG &
        print_spinner true

        output "installing cloudwatch tools...."
        curl https://s3.amazonaws.com/aws-cloudwatch/downloads/latest/awslogs-agent-setup.py -O
        curl https://s3.amazonaws.com/aws-cloudwatch/downloads/latest/AgentDependencies.tar.gz -O
        tar xvf AgentDependencies.tar.gz -C /tmp/
        python ./awslogs-agent-setup.py --region $REGION --dependency-path /tmp/AgentDependencies -n -c /tmp/devops/awslogs/awslogs.conf
    else
        output "No awslogs.conf so can't set up cloudfront"
    fi

    # copy the devops folder to a local dir
    if [[ ! -d /usr/local/learninglocker ]]; then
        mkdir -p /usr/local/learninglocker
    fi
    cp -R /tmp/devops /usr/local/learninglocker/
    cd /tmp


# open-source AMI stuff
elif [[ $SETUP_AMI == true ]]; then
    cd /tmp/deploy
    # write install path
    output "setting the install path in to /etc/learninglocker"
    echo $SYMLINK_PATH > /etc/learninglocker/install_path
    # user creation script
    output "setting up user creation script"
    if [[ ! -f /var/log/learninglocker/user_setup.log ]]; then
        touch /var/log/learninglocker/user_setup.log
        chown ubuntu:ubuntu /var/log/learninglocker/user_setup.log
    fi
    # copy the script over to the local filesystem
    cp startup_user_creation.sh /usr/sbin/ll_startup_user_creation.sh
    chmod 755 /usr/sbin/ll_startup_user_creation.sh
    # set up the service
    output "setting up user creation service"
    cp startup_user_creation.service /lib/systemd/system/ll_startup_user_creation.service
    systemctl enable ll_startup_user_creation.service

    # final output
    output "done"
    echo
    output "if you want to now create an AMI you will need to run:"
    output '/tmp/deploy/create_ami.sh -n "NAME" -d "DESCRIPTION" -a AWS_ACCOUNT_ID -k USER_KEY -s USER_SECRET -v VISIBILITY -r REGION'
    output " where visibility is 'public' or 'private' & region is the AWS region name ie: us-east-1"
    echo
fi


if [[ $DONE_MIGRATIONS == false ]]; then
    output_log "Printing migration warning"
    echo "[LL] Note about migrations:"
    echo "     If you're upgrading from an existing install, no matter if this is on a new server or the same one you will have to perform migrations."
    echo "     These migrations take care of cleaning up the database to support new functionality and can be run before you switch to the new release"
    echo "     as they're non-distructive but they will need to be run for things to function correctly. If you're updating an existing install on this"
    echo "     server you should've been prompted to run the migrations. If you chose to not run them or are upgrading by rolling out a new server"
    echo "     you'll need to do this manually. This can be done by running 'cd ${LOCAL_PATH}/${WEBAPP_SUBDIR}; yarn migrate'"
    echo
fi

output "Everything done. Please check the install log in '${OUTPUT_LOG}' for errors."
