CC      = gcc
CFLAGS  = -Wall -Wextra -I./include $(shell pkg-config --cflags libmicrohttpd 2>/dev/null)
LDFLAGS = $(shell pkg-config --libs libmicrohttpd 2>/dev/null || echo -lmicrohttpd)

SRCS = src/main.c \
       src/hashmap.c \
       src/stack.c \
       src/linked_list.c \
       src/queue.c \
       src/outfit.c \
       src/server.c

OBJS   = $(SRCS:.c=.o)
TARGET = server

all: $(TARGET)

$(TARGET): $(OBJS)
	$(CC) $(OBJS) -o $@ $(LDFLAGS)

src/%.o: src/%.c
	$(CC) $(CFLAGS) -c $< -o $@

clean:
	rm -f $(OBJS) $(TARGET)

.PHONY: all clean
