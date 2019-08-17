#!/bin/bash

SHELL_DIR=$(dirname $0)

CMD=${1:-start}

command -v tput > /dev/null || TPUT=false

_echo() {
    if [ -z ${TPUT} ] && [ ! -z $2 ]; then
        echo -e "$(tput setaf $2)$1$(tput sgr0)"
    else
        echo -e "$1"
    fi
}

_read() {
    if [ -z ${TPUT} ]; then
        read -p "$(tput setaf 6)$1$(tput sgr0)" ANSWER
    else
        read -p "$1" ANSWER
    fi
}

_result() {
    _echo "# $@" 4
}

_command() {
    _echo "$ $@" 3
}

_success() {
    _echo "+ $@" 2
    exit 0
}

_error() {
    _echo "- $@" 1
    exit 1
}

_get_pid() {
    PID=$(ps -ef | grep node | grep " server[.]js" | head -1 | awk '{print $2}' | xargs)
}

_stop() {
    _get_pid

    if [ "${PID}" != "" ]; then
        _command "kill -9 ${PID}"
        kill -9 ${PID}

        _result "deepracer-timer killed: ${PID}"
    fi
}

_start() {
    _get_pid

    if [ "${PID}" != "" ]; then
        _error "deepracer-timer already started: ${PID}"
    fi

    pushd ${SHELL_DIR}

    echo "# _start" > nohup.out
    _command "nohup node server.js &"
    nohup node server.js &

    popd

    _get_pid

    if [ "${PID}" != "" ]; then
        _result "deepracer-timer started: ${PID}"
    fi
}

_init() {
    pushd ${SHELL_DIR}
    git pull
    npm run build
    popd
}

case ${CMD} in
    init)
        _stop
        _init
        _start
        ;;
    start)
        _start
        ;;
    restart)
        _stop
        _start
        ;;
    stop)
        _stop
        ;;
esac
