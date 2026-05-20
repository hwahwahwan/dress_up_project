#ifndef QUEUE_H
#define QUEUE_H

#include "hashmap.h"  /* Item 타입 사용 */

#define QUEUE_DEFAULT_MAX 10  /* 히스토리 최대 유지 개수 */

typedef struct QueueNode {
    Item              item;
    struct QueueNode *next;
} QueueNode;

typedef struct {
    QueueNode *front;
    QueueNode *rear;
    int        size;
    int        max_size;
} Queue;

Queue *queue_create(int max_size);
void   queue_destroy(Queue *q);

/* 착용 시 히스토리 추가 — max_size 초과 시 가장 오래된 항목 자동 제거 */
void   queue_enqueue(Queue *q, Item item);
Item   queue_dequeue(Queue *q);
Item  *queue_peek(const Queue *q);
int    queue_is_empty(const Queue *q);

/* GET /history 응답용 — 호출자가 free() 해야 함 */
Item  *queue_to_array(const Queue *q, int *count);

#endif
