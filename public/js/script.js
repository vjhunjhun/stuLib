(() => {
  'use strict'

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll('.needs-validation')

  // Loop over them and prevent submission
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
      }

      form.classList.add('was-validated')
    }, false)
  });

  document.addEventListener("DOMContentLoaded", function () {
  const confirmModalEl = document.getElementById("confirmModal");
    if(confirmModalEl){
      
      confirmModalEl.addEventListener('hide.bs.modal', () => {
        if (confirmModalEl.contains(document.activeElement)) {
          document.activeElement.blur();
        }
      });

    }
    const deleteModalEl = document.getElementById("deleteAccountModal");
     if(deleteModalEl){
      
      deleteModalEl.addEventListener('hide.bs.modal', () => {
        if (deleteModalEl.contains(document.activeElement)) {
          document.activeElement.blur();
        }
      });

    }
});

})()