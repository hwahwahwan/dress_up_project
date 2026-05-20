#ifndef HASHMAP_H
#define HASHMAP_H

#define TABLE_SIZE      64
#define MAX_NAME_LEN    64
#define MAX_CATEGORY_LEN 32
#define MAX_FILENAME_LEN 128

/* 아이템 데이터 */
typedef struct {
    int  id;
    char name[MAX_NAME_LEN];
    char category[MAX_CATEGORY_LEN];
    char filename[MAX_FILENAME_LEN];
} Item;

/* 체이닝용 노드 */
typedef struct HashNode {
    Item             item;
    struct HashNode *next;
} HashNode;

/* HashMap 본체 */
typedef struct {
    HashNode *buckets[TABLE_SIZE];
    int       size;
} HashMap;

HashMap *hashmap_create(void);
void     hashmap_destroy(HashMap *map);
void     hashmap_insert(HashMap *map, Item item);
Item    *hashmap_get(HashMap *map, int id);
void     hashmap_remove(HashMap *map, int id);

/* 카테고리별 아이템 배열 반환 — 호출자가 free() 해야 함 */
Item   **hashmap_get_by_category(HashMap *map, const char *category, int *count);

#endif
