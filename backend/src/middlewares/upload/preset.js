export default uploadPreset = {
    invoiceImage: {
        subdir: "invoices",
        allowedMimes: ["image/png", "image/jpeg", "image/webp"],
        maxSizeBytes: 5 * 1024 * 1024, // 5MB
        fieldName: "file",
        mode: "single",
    },

    transportImage: {
        subdir: "invoices",
        allowedMimes: ["image/png", "image/jpeg", "image/webp"],
        maxSizeBytes: 5 * 1024 * 1024, // 5MB
        fieldName: "file",
        mode: "single",
      }
}