![d3js logo](https://github.com/richardadalton/d3examples/blob/gh-pages/resources/d3logo.png?raw=true)

# D3.js Visualizations

## How to use
To take a look at our website and visualizations, you can go to the link we have provided: https://c5laungani.github.io/d3/

As an alternative you can also unzip the zip file. Now you can open the folder using an IDE such as Visual Studio Code or Webstorm.
If you are using Visual Studio Code, make sure the "Live Server" extension is downloaded. 
From here, you can open the index.html file on local host with a browser. This can be run on local host and this is our main website. 


# Feature Explanation
**The features will be explained based on each page of the website.**

# Home
A description of the website is given here. 

# Visualization 1 : Hierarchical edge bundling
The hierarchical edge bundling visualization has been implemented after reading in the dataset. 

**You may hover over any specific employee's email address to see the email addresses of all the person that the employee has sent an email to.
The highlighted email is made bold and the links are colored with a shade of blue. There is also text that pops up that tells you how many email 
addresses this is incase there are too many links to view clearly.**

**Furthermore, you can also hover over any of the employee types which will allow you to view all corresponding employees and their outgoing links.**

# Visualization 2: Chord dependency diagram 
The chord dependency diagram allows you to get a view on how many emails were sent from one employee type to another. 

**You can hover over any part of the circumference of the circle which corresponds to a specific employee type. A text box now pops up allowing you to see
the total number of employees that sent emails to this employee type as well as the total number of employees that emails were sent to
from this employee type. These are represented by the incoming and outgoing values.** 

**You can also hover over any of the chords of the circle. This gives you information regarding the relationship among two employee types. It displays
the incoming and outgoing employee type followed by the number of emails sent from the incoming to outgoing employee type.** 

# Summary Statistics
**Two additional visualizations are given here. One of them is a barchart showing the frequency of each employee type. The other is a barchart showing 
the total emails sent of each employee type.**

# Visualizations 
**On this page, you can see both of our visualizations on the same page.**
**You can also make use of the brushing and linking feature that we have implemented here. You can brush any area corresponding to an 
employee type on the chord dependency diagram. As a result, the corresponding email addresses of that employee type, alongside their outgoing links
will be highlighted in the hierarchical edge bundling visualization.**
