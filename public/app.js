// Registration form validation
const form = document.getElementById('registerForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const firstName = document.getElementById('first_name').value;
    const lastName = document.getElementById('last_name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const phoneNumber = document.getElementById('phone').value;
    const dateOfBirth = document.getElementById('date_of_birth').value;
    const gender = document.getElementById('gender').value;
    const address = document.getElementById('address').value;
    const region = document.getElementById('region').value;
    const contact = document.getElementById('contact').value;
    const termsAccepted = document.getElementById('terms').checked;

    //Processing the form data/storing it in an object
    const formData = {
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      dateOfBirth,
      gender,
      address,
      region,
      contact,
      termsAccepted
    };
    //Calling function to validate and display the form summary
    if (validateForm(formData)) {
      try {
        const response = await fetch('/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            password: formData.password,
            address: formData.address,
          }),
        });
  
        const data = await response.json();
        if (response.ok) {
          alert('Registration submitted successfully.');
          displayFormData(formData); // Display summary after successful submission
        } else {
          alert(data.message || 'Failed to register. Please try again.');
        }
      } catch (error) {
        alert('An error occurred while submitting the form. Please try again.');
        console.error(error);
      }
    }
    // validateForm(formData);
});

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

function validateForm(data) {
  let errorMessage = '';
  //Performs basic validation checks
  if (!data.firstName || data.firstName.trim() === '') errorMessage += 'First name is required.\n';
  if (!data.lastName || data.lastName.trim() === '') errorMessage += 'Last name is required.\n';
  if (!data.email || !validateEmail(data.email)) errorMessage += 'Invalid email.\n';
  if (!data.password || data.password.length < 6 ) errorMessage += 'Password must be atleast six characters long.\n';
  if (!data.phoneNumber) errorMessage += 'Please enter your phone number.\n';
  if (!data.dateOfBirth) errorMessage += 'Please select your date of birth.\n';
  if (!data.gender) errorMessage += 'Please select your gender.\n';
  if (!data.address) errorMessage += 'Please enter a valid address.\n';
  if (!data.region) errorMessage += 'Please select your region of residence.\n';
  if (!data.contact) errorMessage += 'Please select a preferred contact method.\n';
  if (!data.termsAccepted) {
    errorMessage += 'You must accept the terms and conditions.\n';
  }

  //Show error or proceed
  if (errorMessage) {
    alert(errorMessage);
    return false;
  }
  return true;
}

function displayFormData(data) {
  const formSummary = document.getElementById('formSummary');
  if (formSummary) {
    formSummary.innerHTML = `
      <h3>Form Summary</h3>
      <p><strong>First Name:</strong> ${data.firstName}</p>
      <p><strong>Last Name:</strong> ${data.lastName}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Password:</strong> ${data.password}</p>
      <p><strong>Phone Number:</strong> ${data.phoneNumber}</p>
      <p><strong>Date of Birth:</strong> ${data.dateOfBirth}</p>
      <p><strong>Gender:</strong> ${data.gender}</p>
      <p><strong>Address:</strong> ${data.address}</p>
      <p><strong>Region of Residence:</strong> ${data.region}</p>
      <p><strong>Preferred Contact Method:</strong> ${data.contact}</p>
      <p><strong>Terms Accepted:</strong> ${data.termsAccepted ? 'Yes' : 'No'}</p>
  `;
  }
}

//Log in validation
document.getElementById('loginForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  const response = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
  });
  
  const result = await response.json();
  if (result.token) {
      localStorage.setItem('authToken', result.token);  // Save token
      alert('Login successful');
      window.location.href = '/profile.html';
  } else {
      alert(result.error);
  }
});

// Submit Appointment Form
document.getElementById('appointmentForm').addEventListener('submit', function(e) {
    e.preventDefault();
  
    const doctor = document.getElementById('doctor').value;
    const date = document.getElementById('appointmentDate').value;
    const time = document.getElementById('appointmentTime').value;
  
    const token = localStorage.getItem('authToken'); // JWT stored in localStorage
  
    // Make a POST request to the backend to book the appointment
    fetch('/appointments/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify({ doctor, date, time })
    })
    .then(response => response.json())
    .then(data => {
      alert('Appointment booked successfully!');
    })
    .catch(error => console.error('Error:', error));
  });
  
// Submit Profile Update Form
document.getElementById('profileForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const firstName = document.getElementById('first_name').value;
  const lastName = document.getElementById('last_name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const address = document.getElementById('address').value;
  
  const token = localStorage.getItem('authToken');
  
  // Make a PUT request to update the user profile
  fetch('/users/update', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token
    },
    body: JSON.stringify({ firstName, lastName, email, password, address })
  })
  .then(response => response.json())
  .then(data => {
    alert('Profile updated successfully!');
  })
  .catch(error => console.error('Error:', error));
});  

//profile pic
function previewProfilePic(event) {
  const file = event.target.files[0];
  if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
          document.getElementById('profile-pic').src = e.target.result;
      };
      reader.readAsDataURL(file);
  } else {
    alert('Please upload a valid image file.');
  }
}
