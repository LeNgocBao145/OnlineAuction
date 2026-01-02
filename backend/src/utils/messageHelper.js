export const emitNewMessage = (io, product, message) => {
    io.to(product.id.toString()).emit("new-message", {
        message,
    })
}