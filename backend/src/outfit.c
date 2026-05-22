#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>
#include "outfit.h"

/* ─── 상수 ─── */
#define NUM_CATEGORIES  4
#define JSON_ITEM_CAP   256
#define JSON_ARRAY_CAP  4096
#define JSON_OUTFIT_CAP 2048

static const char *CATEGORIES[NUM_CATEGORIES] = {
    "tops", "bottoms", "shoes", "accessories"
};

/* ─── 전역 자료구조 ─── */
static HashMap    *g_items   = NULL;
static LinkedList *g_outfit  = NULL;
static Stack      *g_undo    = NULL;
static Queue      *g_history = NULL;

/* ─── items.json 파서 ─── */

static const char *skip_ws(const char *p) {
    while (*p && isspace((unsigned char)*p)) p++;
    return p;
}

static int parse_str(const char *json, const char *key, char *out, int len) {
    char pat[80];
    snprintf(pat, sizeof(pat), "\"%s\"", key);
    const char *p = strstr(json, pat);
    if (!p) return 0;
    p = skip_ws(p + strlen(pat));
    if (*p != ':') return 0;
    p = skip_ws(p + 1);
    if (*p != '"') return 0;
    p++;
    int i = 0;
    while (*p && *p != '"' && i < len - 1) out[i++] = *p++;
    out[i] = '\0';
    return 1;
}

static int parse_int(const char *json, const char *key, int *out) {
    char pat[80];
    snprintf(pat, sizeof(pat), "\"%s\"", key);
    const char *p = strstr(json, pat);
    if (!p) return 0;
    p = skip_ws(p + strlen(pat));
    if (*p != ':') return 0;
    p = skip_ws(p + 1);
    if (!isdigit((unsigned char)*p)) return 0;
    *out = atoi(p);
    return 1;
}

static int load_items(const char *path) {
    FILE *f = fopen(path, "r");
    if (!f) return 0;
    fseek(f, 0, SEEK_END);
    long sz = ftell(f);
    rewind(f);
    char *buf = malloc(sz + 1);
    if (!buf) { fclose(f); return 0; }
    fread(buf, 1, sz, f);
    buf[sz] = '\0';
    fclose(f);

    const char *p = buf;
    while ((p = strchr(p, '{')) != NULL) {
        const char *end = strchr(p, '}');
        if (!end) break;
        int   blen  = (int)(end - p + 1);
        char *block = malloc(blen + 1);
        if (!block) break;
        strncpy(block, p, blen);
        block[blen] = '\0';

        Item item = { 0 };
        if (parse_int(block, "id",       &item.id) &&
            parse_str(block, "name",     item.name,     MAX_NAME_LEN) &&
            parse_str(block, "category", item.category, MAX_CATEGORY_LEN) &&
            parse_str(block, "filename", item.filename, MAX_FILENAME_LEN)) {
            hashmap_insert(g_items, item);
        }
        free(block);
        p = end + 1;
    }
    free(buf);
    return 1;
}

/* ─── JSON 빌더 헬퍼 ─── */

static void item_to_json(const Item *item, char *buf, int len) {
    snprintf(buf, len,
        "{\"id\":%d,\"name\":\"%s\",\"category\":\"%s\",\"filename\":\"%s\"}",
        item->id, item->name, item->category, item->filename);
}

static char *make_error_json(const char *msg) {
    char buf[128];
    snprintf(buf, sizeof(buf), "{\"error\":\"%s\"}", msg);
    return strdup(buf);
}

/* Item** 배열 → JSON 배열 */
static char *item_ptrs_to_json_array(Item **items, int count) {
    char buf[JSON_ARRAY_CAP] = "[";
    for (int i = 0; i < count; i++) {
        char ij[JSON_ITEM_CAP];
        item_to_json(items[i], ij, sizeof(ij));
        if (i > 0) strncat(buf, ",", sizeof(buf) - strlen(buf) - 1);
        strncat(buf, ij, sizeof(buf) - strlen(buf) - 1);
    }
    strncat(buf, "]", sizeof(buf) - strlen(buf) - 1);
    return strdup(buf);
}

/* Item* 배열 → JSON 배열 */
static char *items_to_json_array(Item *items, int count) {
    char buf[JSON_ARRAY_CAP] = "[";
    for (int i = 0; i < count; i++) {
        char ij[JSON_ITEM_CAP];
        item_to_json(&items[i], ij, sizeof(ij));
        if (i > 0) strncat(buf, ",", sizeof(buf) - strlen(buf) - 1);
        strncat(buf, ij, sizeof(buf) - strlen(buf) - 1);
    }
    strncat(buf, "]", sizeof(buf) - strlen(buf) - 1);
    return strdup(buf);
}

/* 현재 outfit → JSON (미착용 카테고리는 null) */
static char *build_outfit_json(void) {
    char buf[JSON_OUTFIT_CAP] = "{";
    for (int i = 0; i < NUM_CATEGORIES; i++) {
        Item *item = linked_list_get_by_category(g_outfit, CATEGORIES[i]);
        char  entry[JSON_ITEM_CAP + 32];
        if (item) {
            char ij[JSON_ITEM_CAP];
            item_to_json(item, ij, sizeof(ij));
            snprintf(entry, sizeof(entry), "%s\"%s\":%s", i ? "," : "", CATEGORIES[i], ij);
        } else {
            snprintf(entry, sizeof(entry), "%s\"%s\":null", i ? "," : "", CATEGORIES[i]);
        }
        strncat(buf, entry, sizeof(buf) - strlen(buf) - 1);
    }
    strncat(buf, "}", sizeof(buf) - strlen(buf) - 1);
    return strdup(buf);
}

/* ─── OutfitState ↔ LinkedList 변환 ─── */

static OutfitState capture_state(void) {
    OutfitState s = { -1, -1, -1, -1 };
    Item *it;
    if ((it = linked_list_get_by_category(g_outfit, "tops")))        s.tops_id        = it->id;
    if ((it = linked_list_get_by_category(g_outfit, "bottoms")))     s.bottoms_id     = it->id;
    if ((it = linked_list_get_by_category(g_outfit, "shoes")))       s.shoes_id       = it->id;
    if ((it = linked_list_get_by_category(g_outfit, "accessories"))) s.accessories_id = it->id;
    return s;
}

static void restore_state(OutfitState s) {
    int ids[NUM_CATEGORIES] = { s.tops_id, s.bottoms_id, s.shoes_id, s.accessories_id };
    linked_list_clear(g_outfit);
    for (int i = 0; i < NUM_CATEGORIES; i++) {
        if (ids[i] == -1) continue;
        Item *item = hashmap_get(g_items, ids[i]);
        if (item) linked_list_append(g_outfit, *item);
    }
}

/* ─── 초기화 / 정리 ─── */

int outfit_init(const char *items_json_path) {
    g_items   = hashmap_create();
    g_outfit  = linked_list_create();
    g_undo    = stack_create();
    g_history = queue_create(QUEUE_DEFAULT_MAX);
    if (!g_items || !g_outfit || !g_undo || !g_history) return 0;
    return load_items(items_json_path);
}

void outfit_cleanup(void) {
    hashmap_destroy(g_items);
    linked_list_destroy(g_outfit);
    stack_destroy(g_undo);
    queue_destroy(g_history);
}

/* ─── API 핸들러 ─── */

char *outfit_get_all_items(void) {
    char buf[JSON_ARRAY_CAP] = "[";
    int  first = 1;
    for (int i = 0; i < TABLE_SIZE; i++) {
        HashNode *node = g_items->buckets[i];
        while (node) {
            char ij[JSON_ITEM_CAP];
            item_to_json(&node->item, ij, sizeof(ij));
            if (!first) strncat(buf, ",", sizeof(buf) - strlen(buf) - 1);
            strncat(buf, ij, sizeof(buf) - strlen(buf) - 1);
            first = 0;
            node  = node->next;
        }
    }
    strncat(buf, "]", sizeof(buf) - strlen(buf) - 1);
    return strdup(buf);
}

char *outfit_get_items_by_category(const char *category) {
    int    count = 0;
    Item **items = hashmap_get_by_category(g_items, category, &count);
    char  *result = item_ptrs_to_json_array(items, count);
    free(items);
    return result;
}

char *outfit_get_current(void) {
    return build_outfit_json();
}

char *outfit_equip(int id) {
    Item *item = hashmap_get(g_items, id);
    if (!item) return make_error_json("item not found");
    stack_push(g_undo, capture_state());
    linked_list_append(g_outfit, *item);
    queue_enqueue(g_history, *item);
    return build_outfit_json();
}

char *outfit_unequip(const char *category) {
    stack_push(g_undo, capture_state());
    linked_list_remove_by_category(g_outfit, category);
    return build_outfit_json();
}

char *outfit_undo(void) {
    if (stack_is_empty(g_undo))
        return make_error_json("nothing to undo");
    restore_state(stack_pop(g_undo));
    return build_outfit_json();
}

char *outfit_reset(void) {
    stack_push(g_undo, capture_state());
    linked_list_clear(g_outfit);
    return build_outfit_json();
}

char *outfit_get_history(void) {
    int   count = 0;
    Item *arr   = queue_to_array(g_history, &count);
    char *result = items_to_json_array(arr, count);
    free(arr);
    return result;
}
