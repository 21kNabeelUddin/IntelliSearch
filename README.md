# IntelliSearch 🔍

IntelliSearch is a modern, AI-powered search engine built with Next.js and Together AI's LLaMA 3 70B model. It provides intelligent, context-aware responses to user queries with a clean, intuitive interface.

## Features ✨

- **AI-Powered Search**: Utilizes Together AI's LLaMA 3 70B model for intelligent responses
- **Modern UI**: Clean, responsive interface built with Next.js and Tailwind CSS
- **Real-time Responses**: Fast, streaming responses to user queries
- **Mobile Responsive**: Fully functional on all device sizes
- **Error Handling**: Robust error handling and user feedback
- **Open Source**: Fully open-source and customizable

## Tech Stack 🛠️

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **AI Integration**: Together AI (LLaMA 3 70B)
- **Deployment**: Vercel
- **Version Control**: Git

## Prerequisites 📋

Before you begin, ensure you have:
- Node.js (v18 or higher)
- npm or yarn
- A Together AI API key ([Get one here](https://together.ai))

## Environment Variables 🔐

Create a `.env.local` file in the root directory with:

```env
TOGETHER_API_KEY=your_together_ai_api_key
```

## Installation & Setup 🚀

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/IntelliSearch.git
   cd IntelliSearch
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Deployment 🌐

The easiest way to deploy IntelliSearch is using Vercel:

1. Push your code to GitHub
2. Import your repository to Vercel
3. Add your `TOGETHER_API_KEY` in Vercel's environment variables
4. Deploy!

## Usage 💡

1. Enter your query in the search box
2. Click the "Search" button or press Enter
3. Receive an AI-generated response based on your query

## Cost Considerations 💰

The project uses Together AI's pay-as-you-go pricing:
- Input tokens: $0.0007 per 1K tokens
- Output tokens: $0.0007 per 1K tokens
- Each query typically costs a fraction of a cent
- Monthly billing based on actual usage

## Contributing 🤝

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License 📄

This project is open source and available under the [MIT License](LICENSE).

## Using This Repository 🚀

To use this repository for your own project:

1. **Fork the Repository**
   - Click the "Fork" button on GitHub
   - This creates your own copy of the project

2. **Clone Your Fork**
   ```bash
   git clone https://github.com/your-username/IntelliSearch.git
   cd IntelliSearch
   ```

3. **Set Up Environment**
   - Create `.env.local` file
   - Add your Together AI API key
   ```env
   TOGETHER_API_KEY=your_api_key_here
   ```

4. **Install & Run**
   ```bash
   npm install
   npm run dev
   ```

5. **Deploy**
   - Connect your GitHub repository to Vercel
   - Add environment variables in Vercel
   - Deploy!

6. **Customize**
   - Modify the UI in the `app` directory
   - Adjust API parameters in `app/api/search/route.ts`
   - Update styling in `tailwind.config.js`

Remember to star ⭐ the repository if you find it helpful!
