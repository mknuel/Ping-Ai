import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
import { Configuration, OpenAIApi } from "openai";

dotenv.config();

const configuration = new Configuration({
	apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", async (req, res) => {
	res.status(200).send({
		message: "Hello from pixie",
	});
});

app.post("/", async (req, res) => {
	try {
		const { prompt } = req.body;

		const response = await openai.createCompletion({
			model: "text-davinci-003",
			prompt: `${prompt}`,
			temperature: 0.5,
			max_tokens: 3000,
			top_p: 1,
			frequency_penalty: 0.5,
			presence_penalty: 0,
			// stop: ['"""'],
		});

		console.log(response.data.choices);
		const bot = response.data.choices[0].text;
		const code = isProgram(bot);

		console.log(code);
		res.status(200).send({
			bot,
		});
	} catch (error) {
		console.log(error);
		res.status(500).send({ error });
	}
});

function isProgram(str) {
	//Check if str is a valid program
	let programRegex = /^\s*\{[\s\S]*\}\s*$/; //Matches strings with opening and closing curly braces
	return programRegex.test(str);
}
app.listen(5000, () => console.log("server is live"));
