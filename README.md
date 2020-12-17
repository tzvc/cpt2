# cpt2

## An on the spot lockdown exemption certificate generator :page_facing_up:

### Context
> Pursuant to the decree n°2020-1310 of October 29th, 2020 prescribing rules necessary in the fight against
the spread of the Covid-19 virus, citizen need a valid exemption form to justify being outside their homes. This form needs to be shown to any police or gendarmerie officer if they request it.

### Demo
Available at https://cpt2.vercel.app?firstname=YourFirstname&lastname=YourLastname&birthday=12/12/1997&placeofbirth=YourBirthCity
> Note: Replace query parameters in the URL with your own informations

### In Action
<img src="https://user-images.githubusercontent.com/14275989/102485525-0a637a00-4068-11eb-946f-4c1002007894.gif" width="200">

### Disclaimer :warning:
This project was built soly to experiment with the follwowing technologies: [Snowpack](https://www.snowpack.dev/), [Vercel Serverless Functions](https://vercel.com/docs/serverless-functions/introduction), [FaunaDB](https://fauna.com/). Use at your own risks.

### How it works
This generator works the following way, uppon opening it will:
- get the users infos from the URL (name, birthday, etc...)
- get the current user location
- reverse geocode an address 600m from that location
- generate a valid certificate for that user and address as if it was made made 20min ago






