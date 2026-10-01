import Swal from "sweetalert2";

// Success is confirmed with a small auto-dismissing toast rather than a blocking modal.
const toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 2800,
    timerProgressBar: true,
    customClass: { popup: "pt-swal-toast" },
    didOpen: (el) => {
        el.addEventListener("mouseenter", Swal.stopTimer);
        el.addEventListener("mouseleave", Swal.resumeTimer);
    },
});

export const swalsucess = (message = "Operation completed successfully") =>
    toast.fire({ icon: "success", title: message });

export default swalsucess;
