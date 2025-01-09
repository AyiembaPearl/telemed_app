//Getting reference to the submitButton to ensure it matches the ID of the submission
const submitButton = document.getElementById('submitButton');

// Registration form validation
const form = document.getElementById('registerForm');
const userRole = form.getAttribute('data-role');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    //common fields for patient, doctor and admin
    const firstName = document.getElementById('first_name').value;
    const lastName = document.getElementById('last_name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const phoneNumber = document.getElementById('phone').value;
    const termsAccepted = document.getElementById('terms').checked;
    //other distinct fields
    let distinctData = {};
    if (userRole === 'doctor') {
      distinctData = {
        specialization: document.getElementById('specialization').value,
        schedule: document.getElementById('schedule').value,
      };
    } else if (userRole === 'admin') {
        distinctData = {
          username: document.getElementById('username').value,
          role: document.getElementById('role').value,
        };
    } else if (userRole === 'patient') {
        distinctData = {
          dateOfBirth: document.getElementById('date_of_birth').value,
          gender: document.getElementById('gender').value,
          address: document.getElementById('address').value,
          region: document.getElementById('region').value,
          contact: document.getElementById('contact').value,
        };
    }
    //preparing the payload
    const payload = { firstName, lastName, email, password, phoneNumber, termsAccepted, ...distinctData };
    
    if (!validateForm(payload)) return;

    //determining the API endpoints
    const endpoint = `/public/${userRole}/register.html`;
    
    submitButton.disabled = true;
    submitButton.innerHTML = 'Processing your request...';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      submitButton.disabled = false;
      submitButton.innerHTML = 'Submit Request';

      if (response.ok) {
        alert(`${userRole} registered successfully!`);
      } else {
          alert(data.error || 'Registration failed!');
      }
    } catch (error) {
      submitButton.disabled = false;
      submitButton.innerHTML = 'Submit Request';
      console.error('Error:', error);
      alert('An error occurred while submitting the form.');
    }
});

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

function validateForm(data) {
  let errorMessage = '';
  //Performs basic validation checks
  //common attributes
  if (!data.firstName || data.firstName.trim() === '') errorMessage += 'First name is required.\n';
  if (!data.lastName || data.lastName.trim() === '') errorMessage += 'Last name is required.\n';
  if (!data.email || !validateEmail(data.email)) errorMessage += 'Invalid email.\n';
  if (!data.password || data.password.length < 6 ) errorMessage += 'Password must be atleast six characters long.\n';
  if (!data.phoneNumber) errorMessage += 'Please enter your phone number.\n';

  //disntict role validation
  if (userRole === 'patient') {
    if (!data.dateOfBirth) errorMessage += 'Please select your date of birth.\n';
    if (!data.gender) errorMessage += 'Please select your gender.\n';
    if (!data.address) errorMessage += 'Please enter a valid address.\n';
    if (!data.region) errorMessage += 'Please select your region of residence.\n';
    if (!data.contact) errorMessage += 'Please select a preferred contact method.\n';
    if (!data.termsAccepted) errorMessage += 'You must accept the terms and conditions.\n';
  } else if (userRole === 'doctor') {
    if (!data.specialization) errorMessage += 'Specialization is required.\n';
    if (!data.schedule) errorMessage += 'Schedule is required.\n';
  } else if (userRole === 'admin') {
    if (!data.username || data.username.trim() === '') errorMessage += 'Username is required.\n';
    if (!data.role || data.role.trim() === '') errorMessage += 'Role is required.\n';
  }

  //Show error or proceed
  if (errorMessage) {
    alert(errorMessage);
    return false;
  }
  return true;
}


//Login validation
const form1 = document.getElementById('loginForm');
const userRole1 = form1.getAttribute('data-role');
  form1.addEventListener('submit', async (event) => {
    event.preventDefault();
    //common login details for patient, doctor and admin
    const password = document.getElementById('password').value;
    //different login details for patient doctor and admin
    let diffData = {};
    if (userRole1 === 'patient' || userRole1 === 'doctor'){
      diffData = {
        email: document.getElementById('email').value,
      };
     } else if (userRole1 === 'admin'){
      diffData = {
        username: document.getElementById('username').value,
      };
    }

    const loginData = { password, ...diffData};

    const endpoint = `/public/${userRole1}/login.html`;

    if(!validateLogin(loginData)) return;

    submitButton.disabled = false;
    submitButton.innerHTML = 'Submit';

    try{
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify(loginData)
      });

      const result = await response.json();
      submitButton.disabled = false;
      submitButton.innerHTML = 'Submit';

      if (response.ok) {
        localStorage.setItem('authToken', result.token);
        alert('Login successful!');
        window.location.href = `/public/${userRole1}/login.html`;
      } else {
        alert(result.role || 'Login failed!')
      }
    } catch(error){
      submitButton.disabled = false;
      submitButton.innerHTML = 'Submit';
      console.error('Error:', error);
      alert('An error occurred while logging in. Try again with the correct credentials');
    }

    //validating token on subsequent pages where needed
    const token = localStorage.getItem('authToken');
    if(!token) {
      alert('You must be logged in to access this page.');
      window.location.href = `/public/${userRole1}/login.html`;
    }
});

function validateLogin(data) {
  let errorMessage = '';
  //Performs basic validation checks
  //common attributes
  if (!data.password || data.password.length < 6 ) errorMessage += 'Password must be atleast six characters long.\n';

  //disntict role validation
  if (userRole1 === 'patient' || userRole1 === 'doctor') {
    if (!data.email || !validateEmail(data.email)) errorMessage += 'Invalid email.\n';
  } else if (userRole1 === 'admin') {
    if (!data.username || data.username.trim() === '') errorMessage += 'Username is required.\n';
  }

  //Show error or proceed
  if (errorMessage) {
    alert(errorMessage);
    return false;
  }
  return true;
}


// //loading/processing user requests
// const submitButton = form.querySelector('button[type="submit"]');
// submitButton.disabled = true;
// submitButton.innerHTML = 'Processing your request...';

// const response = await fetch(endpoint, {
//   method: 'POST',
//   headers: { 'Content-Type': 'application/json' },
//   body: JSON.stringify(payload),
// });



// // Submit Appointment Form
// document.getElementById('appointmentForm').addEventListener('submit', function(e) {
//     e.preventDefault();
  
//     const doctor = document.getElementById('doctor').value;
//     const date = document.getElementById('appointmentDate').value;
//     const time = document.getElementById('appointmentTime').value;
  
//     const token = localStorage.getItem('authToken'); // JWT stored in localStorage
  
//     // Make a POST request to the backend to book the appointment
//     fetch('/appointments/create', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': token
//       },
//       body: JSON.stringify({ doctor, date, time })
//     })
//     .then(response => response.json())
//     .then(data => {
//       alert('Appointment booked successfully!');
//     })
//     .catch(error => console.error('Error:', error));
//   });
  
// // Submit Profile Update Form
// document.getElementById('profileForm').addEventListener('submit', function(e) {
//   e.preventDefault();
  
//   const firstName = document.getElementById('first_name').value;
//   const lastName = document.getElementById('last_name').value;
//   const email = document.getElementById('email').value;
//   const password = document.getElementById('password').value;
//   const address = document.getElementById('address').value;
  
//   const token = localStorage.getItem('authToken');
  
//   // Make a PUT request to update the user profile
//   fetch('/users/update', {
//     method: 'PUT',
//     headers: {
//       'Content-Type': 'application/json',
//       'Authorization': token
//     },
//     body: JSON.stringify({ firstName, lastName, email, password, address })
//   })
//   .then(response => response.json())
//   .then(data => {
//     alert('Profile updated successfully!');
//   })
//   .catch(error => console.error('Error:', error));
// });  

// //profile pic
// function previewProfilePic(event) {
//   const file = event.target.files[0];
//   if (file) {
//       const reader = new FileReader();
//       reader.onload = function (e) {
//           document.getElementById('profile-pic').src = e.target.result;
//       };
//       reader.readAsDataURL(file);
//   } else {
//     alert('Please upload a valid image file.');
//   }
// }
