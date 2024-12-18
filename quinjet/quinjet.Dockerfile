FROM golang:1.23

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .

# Build the Go application
RUN go build -o quinjet ./cmd

EXPOSE 8080
CMD ["./quinjet"]