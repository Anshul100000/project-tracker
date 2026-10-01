import Swal from "sweetalert2";

export const swalerror = (message = "Something went wrong") =>
    Swal.fire({
        icon: "error",
        title: "Something went wrong",
        text: message,
        confirmButtonText: "Close",
        buttonsStyling: false,
        customClass: { popup: "pt-swal", confirmButton: "pt-swal-btn" },
    });

export default swalerror;
