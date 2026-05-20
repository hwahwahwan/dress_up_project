#include <stdio.h>
#include <stdlib.h>
#include <signal.h>
#include "server.h"
#include "outfit.h"

static volatile int running = 1;

static void handle_signal(int sig) {
    (void)sig;
    running = 0;
}

int main(void) {
    signal(SIGINT,  handle_signal);
    signal(SIGTERM, handle_signal);

    if (!outfit_init("data/items.json")) {
        fprintf(stderr, "오류: data/items.json 로딩 실패\n");
        return 1;
    }

    if (!server_start(SERVER_PORT)) {
        outfit_cleanup();
        return 1;
    }

    printf("종료하려면 Ctrl+C\n");
    while (running)
        pause();  /* 시그널 올 때까지 대기 */

    printf("\n서버 종료 중...\n");
    server_stop();
    outfit_cleanup();
    return 0;
}
