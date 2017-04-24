
    Polymer({
      is: 'event-item',
      properties: {
		id: {
          type: String,
          reflectToAttribute: true,
        },
        name: {
          type: String,
          reflectToAttribute: true,
        },
        description: {
          type: String,
          reflectToAttribute: true,
        },
        image: {
          type: String,
          reflectToAttribute: true,
        },
		type: {
          type: String,
          reflectToAttribute: true,
        },
		venue: {
          type: String,
          reflectToAttribute: true,
        },        
		location: {
          type: String,
          reflectToAttribute: true,
        },
		time: {
          type: String,
          reflectToAttribute: true,
        },
       duration: {
          type: String,
          reflectToAttribute: true,
        },
		attendees: {
          type: String,
          reflectToAttribute: true,
        },
      },   
  });