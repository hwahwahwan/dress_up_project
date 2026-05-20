#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "hashmap.h"

/* 아이템 ID를 버킷 인덱스로 변환 */
static int hash(int id) {
    return id % TABLE_SIZE;
}

HashMap *hashmap_create(void) {
    HashMap *map = malloc(sizeof(HashMap));
    if (!map) return NULL;
    for (int i = 0; i < TABLE_SIZE; i++)
        map->buckets[i] = NULL;
    map->size = 0;
    return map;
}

void hashmap_destroy(HashMap *map) {
    if (!map) return;
    for (int i = 0; i < TABLE_SIZE; i++) {
        HashNode *node = map->buckets[i];
        while (node) {
            HashNode *next = node->next;
            free(node);
            node = next;
        }
    }
    free(map);
}

/* 같은 ID가 이미 있으면 덮어쓰기 */
void hashmap_insert(HashMap *map, Item item) {
    int idx = hash(item.id);
    HashNode *node = map->buckets[idx];
    while (node) {
        if (node->item.id == item.id) {
            node->item = item;
            return;
        }
        node = node->next;
    }
    HashNode *new_node = malloc(sizeof(HashNode));
    if (!new_node) return;
    new_node->item = item;
    new_node->next = map->buckets[idx];
    map->buckets[idx] = new_node;
    map->size++;
}

/* O(1) 조회 — 없으면 NULL 반환 */
Item *hashmap_get(HashMap *map, int id) {
    int idx = hash(id);
    HashNode *node = map->buckets[idx];
    while (node) {
        if (node->item.id == id)
            return &node->item;
        node = node->next;
    }
    return NULL;
}

void hashmap_remove(HashMap *map, int id) {
    int idx = hash(id);
    HashNode *node = map->buckets[idx];
    HashNode *prev = NULL;
    while (node) {
        if (node->item.id == id) {
            if (prev)
                prev->next = node->next;
            else
                map->buckets[idx] = node->next;
            free(node);
            map->size--;
            return;
        }
        prev = node;
        node = node->next;
    }
}

Item **hashmap_get_by_category(HashMap *map, const char *category, int *count) {
    *count = 0;
    for (int i = 0; i < TABLE_SIZE; i++) {
        HashNode *node = map->buckets[i];
        while (node) {
            if (strcmp(node->item.category, category) == 0)
                (*count)++;
            node = node->next;
        }
    }
    if (*count == 0) return NULL;

    Item **result = malloc(sizeof(Item *) * (*count));
    if (!result) return NULL;

    int idx = 0;
    for (int i = 0; i < TABLE_SIZE; i++) {
        HashNode *node = map->buckets[i];
        while (node) {
            if (strcmp(node->item.category, category) == 0)
                result[idx++] = &node->item;
            node = node->next;
        }
    }
    return result;
}
