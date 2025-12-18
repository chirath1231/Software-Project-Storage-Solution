import React, { useState } from 'react';
import { Search, Paperclip, Send } from 'lucide-react';
import Navbar from '../components/NavBar/NavBar';
import Sidebar from '../components/Sidebar/Sidebar';
import Footer from '../components/Footer/Footer';

const ClientChatSystem = () => {
  const [selectedClientId, setSelectedClientId] = useState('mirabel');
  const [messageInput, setMessageInput] = useState('');

  const clientsData = {
    zachary: {
      id: 'zachary',
      name: 'Zachary Erza',
      username: 'ZacharyE_Design',
      email: 'zachary.erza@email.com',
      phone: '+1 555 123 4567',
      language: 'English - Native',
      preview: 'Thanks for the update!',
      unread: 1,
      avatar: '👨‍💼',
      online: false,
      lastActive: '5 Hours Ago',
      recentFiles: ['Proposal_v2.pdf', 'Contract_Draft.pdf', 'Budget_2024.xlsx'],
      messages: [
        {
          text: 'Hi! I wanted to discuss the project timeline with you.',
          time: '9:15 AM',
          sender: 'client'
        },
        {
          text: 'Of course! I have some time now. What would you like to know?',
          time: '9:18 AM',
          sender: 'user'
        },
        {
          text: 'When can we expect the first deliverables?',
          time: '9:20 AM',
          sender: 'client'
        },
        {
          text: 'We should have the initial designs ready by next Wednesday.',
          time: '9:22 AM',
          sender: 'user'
        }
      ]
    },
    katrina: {
      id: 'katrina',
      name: 'Katrina Hawkins',
      username: 'KatrinaH_Creative',
      email: 'katrina.h@email.com',
      phone: '+1 555 234 5678',
      language: 'English - Fluent, Spanish - Basic',
      preview: 'Can we schedule a call?',
      unread: 3,
      avatar: '👩‍💻',
      online: true,
      lastActive: 'Online',
      recentFiles: ['Mockup_Final.fig', 'Assets.zip', 'Guidelines.pdf'],
      messages: [
        {
          text: 'Hey! I love the new designs you sent over.',
          time: '10:30 AM',
          sender: 'client'
        },
        {
          text: 'Can we schedule a call to discuss the next steps?',
          time: '10:31 AM',
          sender: 'client'
        },
        {
          text: 'I have a few questions about the color scheme.',
          time: '10:32 AM',
          sender: 'client'
        }
      ]
    },
    mirabel: {
      id: 'mirabel',
      name: 'Mirabel Perera',
      username: 'MirabelPerera20',
      email: 'mirabel@gmail.com',
      phone: '+94 123 456 789',
      language: 'English - Fluent',
      preview: 'Perfect! Looking forward to it.',
      unread: 0,
      avatar: '👩‍🎨',
      online: true,
      lastActive: '2 Hours Ago',
      recentFiles: ['File01.pdf', 'Presentation.pptx', 'Notes.docx'],
      messages: [
        {
          text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
          time: '2:01 PM',
          sender: 'client'
        },
        {
          text: 'Lorem ipsum dolor sit amet, consectetur adipiscing',
          time: '2:01 PM',
          sender: 'user'
        },
        {
          text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
          time: '2:01 PM',
          sender: 'client'
        }
      ]
    },
    dor: {
      id: 'dor',
      name: 'Dor Ian',
      username: 'DorIan_Dev',
      email: 'dor.ian@email.com',
      phone: '+44 20 7946 0958',
      language: 'English - Native, French - Fluent',
      preview: 'The deployment went smoothly',
      unread: 0,
      avatar: '👨‍🔧',
      online: false,
      lastActive: '1 Day Ago',
      recentFiles: ['Technical_Spec.pdf', 'API_Docs.pdf', 'Schema.sql'],
      messages: [
        {
          text: 'The deployment went smoothly yesterday. Everything is running as expected.',
          time: '11:45 AM',
          sender: 'client'
        },
        {
          text: 'Great to hear! Did you encounter any issues during the process?',
          time: '11:50 AM',
          sender: 'user'
        },
        {
          text: 'No major issues, just a minor configuration adjustment needed.',
          time: '11:52 AM',
          sender: 'client'
        }
      ]
    },
    hamnet: {
      id: 'hamnet',
      name: 'Hamnet Pierce',
      username: 'HamnetP_Marketing',
      email: 'hamnet.pierce@email.com',
      phone: '+1 555 345 6789',
      language: 'English - Native',
      preview: 'Sounds good to me!',
      unread: 0,
      avatar: '👨‍💼',
      online: true,
      lastActive: 'Online',
      recentFiles: ['Campaign_Q4.pdf', 'Analytics_Report.xlsx', 'Strategy.pptx'],
      messages: [
        {
          text: 'I reviewed the marketing materials. They look fantastic!',
          time: '3:15 PM',
          sender: 'client'
        },
        {
          text: 'Thank you! We put a lot of effort into the design.',
          time: '3:20 PM',
          sender: 'user'
        },
        {
          text: 'Sounds good to me! Let\'s proceed with the launch next week.',
          time: '3:25 PM',
          sender: 'client'
        }
      ]
    }
  };

  const selectedClient = clientsData[selectedClientId];

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      // In a real app, you would add the message to the chat
      setMessageInput('');
    }
  };

  return (
    <div >
      <Navbar />

      <div className="flex h-screen bg-white  ">


        <Sidebar />

<div className=" flex flex-row mt-10 mb-5 flex-1 bg-white  ">

        {/* Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col shadow-lg">
          {/* Header */}

          {/* Search */}
          <div className="p-7 border-b border-gray-200 shadow-lg">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Client List */}
          <div className="flex-1 overflow-y-auto">
            {Object.values(clientsData).map((client) => (
              <div
                key={client.id}
                onClick={() => setSelectedClientId(client.id)}
                className={`flex items-center gap-3 p-4 cursor-pointer transition-colors ${selectedClientId === client.id
                  ? 'bg-orange-400 text-white'
                  : 'hover:bg-gray-50'
                  }`}
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-yellow-400 flex items-center justify-center text-2xl">
                    {client.avatar}
                  </div>
                  {client.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-semibold truncate ${selectedClientId === client.id ? 'text-white' : 'text-gray-900'
                    }`}>
                    {client.name}
                  </h3>
                  <p className={`text-sm truncate ${selectedClientId === client.id ? 'text-white/80' : 'text-gray-500'
                    }`}>
                    {client.preview}
                  </p>
                </div>
                {client.unread > 0 && (
                  <div className="flex-shrink-0 w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                    {client.unread}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Chat Header */}
          <div className="bg-orange-100 p-6 ">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-yellow-400 flex items-center justify-center text-2xl">
                  {selectedClient.avatar}
                </div>
                {selectedClient.online && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedClient.name}</h2>
                <p className="text-sm text-gray-600">{selectedClient.online ? 'Active now' : selectedClient.lastActive}</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {selectedClient.messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-md rounded-2xl p-4 ${message.sender === 'user'
                    ? 'bg-gradient-to-br from-orange-400 to-yellow-400 text-white shadow-lg'
                    : 'bg-white shadow-lg text-gray-900'
                    }`}
                >
                  <p className={message.sender === 'user' ? 'text-white' : 'text-gray-900'}>
                    {message.text}
                  </p>
                  <p className={`text-xs mt-2 ${message.sender === 'user' ? 'text-white/80' : 'text-gray-500'
                    } text-right`}>
                    {message.time}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="p-6 bg-white  ">
            <div className="flex items-center gap-3 shadow-lg">
              <input
                type="text"
                placeholder="Type a message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 px-4 py-3   focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button className="p-3 text-gray-500 hover:text-gray-700 transition-colors">
                <Paperclip className="w-6 h-6" />
              </button>
              <button
                onClick={handleSendMessage}
                className="p-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Client Details Sidebar */}
        <div className="w-80 bg-orange-50 shadow-lg p-6 overflow-y-auto mr-10 ">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="relative mb-4">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-yellow-400 flex items-center justify-center text-5xl border-4 border-white shadow-lg">
                {selectedClient.avatar}
              </div>
              {selectedClient.online && (
                <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 rounded-full border-3 border-white"></div>
              )}
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{selectedClient.name}</h2>
            <p className="text-sm text-gray-600 mt-1">{selectedClient.username}</p>
            <p className="text-sm text-gray-600">{selectedClient.email}</p>
            <p className="text-sm text-gray-600">{selectedClient.phone}</p>
            <p className="text-sm text-gray-600 mt-2">{selectedClient.language}</p>
          </div>

          <hr className="border-gray-300 my-4" />

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Last Active:</h3>
              <p className="text-gray-700">{selectedClient.lastActive}</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Recent Shared:</h3>
              <div className="space-y-2">
                {selectedClient.recentFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 bg-white rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                      <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-700">{file}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
</div>
      <Footer />
    </div>
  );
};

export default ClientChatSystem;