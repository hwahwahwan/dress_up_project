#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <microhttpd.h>
#include "server.h"
#include "outfit.h"

static struct MHD_Daemon *g_daemon = NULL;

/* JSON 응답 전송 + CORS 헤더 공통 처리 */
static enum MHD_Result send_json(
    struct MHD_Connection *conn,
    const char *body,
    unsigned int status)
{
    struct MHD_Response *resp = MHD_create_response_from_buffer(
        strlen(body), (void *)body, MHD_RESPMEM_MUST_COPY);
    MHD_add_response_header(resp, "Content-Type",                 "application/json");
    MHD_add_response_header(resp, "Access-Control-Allow-Origin",  "*");
    MHD_add_response_header(resp, "Access-Control-Allow-Methods", "GET, POST");
    MHD_add_response_header(resp, "Access-Control-Allow-Headers", "Content-Type");
    enum MHD_Result ret = MHD_queue_response(conn, status, resp);
    MHD_destroy_response(resp);
    return ret;
}

static enum MHD_Result request_handler(
    void *cls,
    struct MHD_Connection *conn,
    const char *url,
    const char *method,
    const char *version,
    const char *upload_data,
    size_t *upload_data_size,
    void **con_cls)
{
    (void)cls; (void)version; (void)upload_data; (void)upload_data_size; (void)con_cls;

    /* CORS preflight */
    if (strcmp(method, "OPTIONS") == 0)
        return send_json(conn, "", MHD_HTTP_OK);

    char *body = NULL;

    if (strcmp(method, "GET") == 0) {
        if (strcmp(url, "/items") == 0) {
            body = outfit_get_all_items();
        } else if (strncmp(url, "/items/", 7) == 0) {
            body = outfit_get_items_by_category(url + 7);
        } else if (strcmp(url, "/outfit") == 0) {
            body = outfit_get_current();
        } else if (strcmp(url, "/history") == 0) {
            body = outfit_get_history();
        }
    } else if (strcmp(method, "POST") == 0) {
        if (strncmp(url, "/equip/", 7) == 0) {
            body = outfit_equip(atoi(url + 7));
        } else if (strncmp(url, "/unequip/", 9) == 0) {
            body = outfit_unequip(url + 9);
        } else if (strcmp(url, "/undo") == 0) {
            body = outfit_undo();
        } else if (strcmp(url, "/reset") == 0) {
            body = outfit_reset();
        }
    }

    if (!body)
        return send_json(conn, "{\"error\":\"not found\"}", MHD_HTTP_NOT_FOUND);

    enum MHD_Result ret = send_json(conn, body, MHD_HTTP_OK);
    free(body);
    return ret;
}

int server_start(int port) {
    g_daemon = MHD_start_daemon(
        MHD_USE_INTERNAL_POLLING_THREAD,
        port,
        NULL, NULL,
        &request_handler, NULL,
        MHD_OPTION_END);
    if (!g_daemon) {
        fprintf(stderr, "서버 시작 실패 (port %d)\n", port);
        return 0;
    }
    printf("서버 실행 중: http://localhost:%d\n", port);
    return 1;
}

void server_stop(void) {
    if (g_daemon) {
        MHD_stop_daemon(g_daemon);
        g_daemon = NULL;
    }
}
