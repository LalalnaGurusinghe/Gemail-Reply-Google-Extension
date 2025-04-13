console.log("Content script loaded");

function createAIButton() {
    const button = document.createElement('div');
    button.className = 'T-I J-J5-JI aoO v7 T-I-atl L3';
    button.style.marginRight = '8px';
    button.innerHTML = 'AI Reply'; // Set button text
    button.setAttribute('role', 'button');
    button.setAttribute('data-tooltip', 'Generate AI Reply'); // Tooltip text
    return button;


}

function getEmailContent() {
    const selectors = [
        '.h7',
        '.a3s.aiL',
        '.gmail_quote ',
        '[role="presentation"]' // Add more selectors as needed
    ]
    for (const selector of selectors) {
       const content = document.querySelector(selector); 
         if (content) {
              
              return content.innerText.trim(); // Return the inner text of the email content
         }
         return ''; // Return null if no suitable toolbar is found
    }
} 

function findComposeToolbar() {
    const selectors = [
        '.btC',
        '.aDh',
        '[role="toolbar"]',
        '.gU.Up'
    ]
    for (const selector of selectors) {
       const toolbar = document.querySelector(selector); 
         if (toolbar) {
              console.log("Compose toolbar found:", selector);
              return toolbar;
         }
         return null; // Return null if no suitable toolbar is found
    }
}  
function injectButton() {
    const existingButton = document.querySelector('.ai-reply-button');
    if (existingButton) existingButton.remove(); // Remove existing button if present

    const toolbar = findComposeToolbar();
    if(!toolbar){
        console.log("No suitable toolbar found for injection");
        return;
    }

    console.log("Toolbar Fond , creating the Ai button");
    const button = createAIButton(); 
    button.classList.add('ai-reply-button'); // Add a class for easy selection later
    button.textContent = 'AI Reply'; // Set button text

    button.addEventListener('click', async() => {
        console.log("AI Reply button clicked");
        // Add your AI reply logic here
        try {
            button.innerHTML = 'Generating...'; // Change button text to indicate processing
            button.disabled == true; // Disable button to prevent multiple clicks

            const emailContent = getEmailContent(); // Function to get the email content
            const response = await fetch('http://localhost:8080/api/email/generate',{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    emailContent: emailContent, // Pass the email content to the server
                    tone: "professional"

                }) // Send the email content to your server for processing

            });

            if(!response.ok){
                throw new Error("Network response was not ok");
            }

            const generatedReply = await response.text(); // Get the generated reply from the server
            const composeBox = document.querySelector('[role="textbox"][g_editable="true"]'); // Find the compose box
            if (composeBox){
                composeBox.focus();
                document.execCommand('insertText', false, generatedReply); // Insert the generated reply into the compose box
            }else{
                console.log("Compose box not found for inserting reply");
            }
        } catch (error) {
            console.error(error)
            alert("Error generating AI reply:", error);
        }finally{
            button.innerHTML = 'AI Reply'; // Reset button text
            button.disabled == false; // Re-enable button
        }
    });

    toolbar.insertBefore(button, toolbar.firstChild); // Insert button at the start of the toolbar
    console.log("Button injected successfully");
}

const observer = new MutationObserver((mutations) => {
  let composeDetected = false;
  for (const mutation of mutations) {
    const addedNodes = Array.from(mutation.addedNodes);
    for (const node of addedNodes) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        // Check for reply compose elements (inline reply or dialog)
        const isComposeElement =
          node.matches('div[contenteditable="true"], textarea, .aDm, [role="dialog"]') ||
          node.querySelector('div[contenteditable="true"], textarea, .aDm');
        if (isComposeElement) {
          console.log("Compose elements detected, injecting script...");
          composeDetected = true;
          setTimeout(() => {
            if (injectButton()) {
              console.log("Injection successful");
            } else {
              console.log("No suitable compose area found for injection");
            }
          }, 500);
          break; // Exit loop once a compose element is found
        }
      }
    }
    if (composeDetected) break; // Exit mutation loop
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});