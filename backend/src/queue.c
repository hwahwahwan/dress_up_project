#include <stdlib.h>
#include "queue.h"

Queue *queue_create(int max_size) {
    Queue *q = malloc(sizeof(Queue));
    if (!q) return NULL;
    q->front    = NULL;
    q->rear     = NULL;
    q->size     = 0;
    q->max_size = (max_size > 0) ? max_size : QUEUE_DEFAULT_MAX;
    return q;
}

void queue_destroy(Queue *q) {
    if (!q) return;
    QueueNode *node = q->front;
    while (node) {
        QueueNode *next = node->next;
        free(node);
        node = next;
    }
    free(q);
}

/* max_size 초과 시 front(가장 오래된 항목)를 먼저 제거 */
void queue_enqueue(Queue *q, Item item) {
    if (q->size >= q->max_size)
        queue_dequeue(q);

    QueueNode *node = malloc(sizeof(QueueNode));
    if (!node) return;
    node->item = item;
    node->next = NULL;

    if (!q->rear) {
        q->front = q->rear = node;
    } else {
        q->rear->next = node;
        q->rear       = node;
    }
    q->size++;
}

Item queue_dequeue(Queue *q) {
    Item empty = { -1, "", "", "" };
    if (queue_is_empty(q)) return empty;

    QueueNode *node = q->front;
    Item       item = node->item;
    q->front = node->next;
    if (!q->front) q->rear = NULL;
    free(node);
    q->size--;
    return item;
}

Item *queue_peek(const Queue *q) {
    if (queue_is_empty(q)) return NULL;
    return &q->front->item;
}

int queue_is_empty(const Queue *q) {
    return q->front == NULL;
}

/* 현재 히스토리를 배열로 복사해 반환 (front → rear 순서) */
Item *queue_to_array(const Queue *q, int *count) {
    *count = q->size;
    if (*count == 0) return NULL;

    Item      *arr  = malloc(sizeof(Item) * (*count));
    if (!arr) return NULL;

    QueueNode *node = q->front;
    for (int i = 0; i < *count; i++) {
        arr[i] = node->item;
        node   = node->next;
    }
    return arr;
}
