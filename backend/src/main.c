#include <stdio.h>
#include <stdlib.h>
#include <signal.h>
#include <unistd.h>
#include "server.h"
#include "outfit.h"

#define ITEMS_JSON_PATH "data/items.json"

static volatile int running = 1;

static void handle_signal(int sig) {
    (void)sig;
    running = 0;
}

int main(void) {
    signal(SIGINT,  handle_signal);
    signal(SIGTERM, handle_signal);

    if (!outfit_init(ITEMS_JSON_PATH)) {
        fprintf(stderr, "오류: %s 로딩 실패\n", ITEMS_JSON_PATH);
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
