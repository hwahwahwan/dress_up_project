#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <microhttpd.h>
#include "server.h"
#include "outfit.h"

/* ─── URL 경로 상수 ─── */
#define URL_ITEMS        "/items"
#define URL_ITEMS_PREFIX "/items/"
#define URL_OUTFIT       "/outfit"
#define URL_HISTORY      "/history"
#define URL_EQUIP_PREFIX "/equip/"
#define URL_UNEQUIP_PREFIX "/unequip/"
#define URL_UNDO         "/undo"
#define URL_RESET        "/reset"

static struct MHD_Daemon *g_daemon = NULL;

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

    if (strcmp(method, "OPTIONS") == 0)
        return send_json(conn, "", MHD_HTTP_OK);

    char *body = NULL;

    if (strcmp(method, "GET") == 0) {
        if (strcmp(url, URL_ITEMS) == 0) {
            body = outfit_get_all_items();
        } else if (strncmp(url, URL_ITEMS_PREFIX, strlen(URL_ITEMS_PREFIX)) == 0) {
            body = outfit_get_items_by_category(url + strlen(URL_ITEMS_PREFIX));
        } else if (strcmp(url, URL_OUTFIT) == 0) {
            body = outfit_get_current();
        } else if (strcmp(url, URL_HISTORY) == 0) {
            body = outfit_get_history();
        }
    } else if (strcmp(method, "POST") == 0) {
        if (strncmp(url, URL_EQUIP_PREFIX, strlen(URL_EQUIP_PREFIX)) == 0) {
            body = outfit_equip(atoi(url + strlen(URL_EQUIP_PREFIX)));
        } else if (strncmp(url, URL_UNEQUIP_PREFIX, strlen(URL_UNEQUIP_PREFIX)) == 0) {
            body = outfit_unequip(url + strlen(URL_UNEQUIP_PREFIX));
        } else if (strcmp(url, URL_UNDO) == 0) {
            body = outfit_undo();
        } else if (strcmp(url, URL_RESET) == 0) {
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
