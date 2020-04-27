import React, { Component } from 'react';

import './css/UserInput.css';

import { MdMic } from 'react-icons/md';


import * as qna from '@tensorflow-models/qna';


export default class UserInput extends Component {


    constructor(props) {

        super(props);

        this.model = undefined;

        this.recognition = undefined;

        this.listening = false;

        this.synth = undefined;

        this.userInput = undefined;

        this.state = {

            listening: false

        };

    }

    //---------------------

    async componentDidMount() {

        this.model = await qna.load();

        if ('speechSynthesis' in window) {

            this.synth = window.speechSynthesis;

        }


        if ('webkitSpeechRecognition' in window) {

            this.recognition = new window.webkitSpeechRecognition();

            this.recognition.continous = true;

            this.recognition.lang = "en-US";

            this.recognition.interimResults = true;

            this.recognition.maxAlternatives = 1;

            this.userInput = undefined;


        }

        this.recognition.onresult = e => {

            if (this.listening) {

                let res = e.results[0][0].transcript;

                this.props.demo(res);

                this.userInput = res;

            }

        };


        this.recognition.onspeechend = e => {
            if (this.listening) {
                this.recognition.stop();

                this.setState({ listening: false });

                this.AssistantReply(this.userInput);


                this.props.currentStatus('stopped');

            }
        };


        this.recognition.onsoundend = e => {
            if (this.listening) {
                this.listening = false;
                this.recognition.stop();
                this.setState({ listening: false });

                this.props.currentStatus('stopped');

            }
        };



        this.recognition.onnomatch = e => {
            this.recognition.stop();
            this.setState({ listening: false });
            this.props.demo("Sorry, i didn't recognize it");

            this.props.currentStatus('stopped');
        };


        this.recognition.onerror = e => {
            this.recognition.stop();
            this.setState({ listening: false });
            alert('Current we are having a trouble!... Please try again later');
            console.log(e);

            this.props.currentStatus('stopped');

        };




    }

    //--------------------------------------------------------

    AssistantReply = async (userInput) => {

        let passage = "my name is adarsh and i am your assistant";

        if (userInput !== undefined) {

            let model = await this.model;

            let answers = await model.findAnswers(userInput, passage);

            if (answers[0] !== undefined) {

                this.props.demo(answers[0].text);

                let replyFromBot = new window.SpeechSynthesisUtterance(answers[0].text);
                this.synth.speak(replyFromBot);

                replyFromBot.addEventListener('start', e => {

                    this.props.currentStatus('speaking');

                });

                replyFromBot.addEventListener('end', e => {

                    this.props.currentStatus('stopped');

                });




            }

        }


    };


    //----------------------------------------------

    startListening = () => {

        if (this.state.listening === true) {

            this.setState({ listening: false });

            if (this.listening) {

                this.recognition.stop();

                this.props.currentStatus('stopped');

            }

        } else {

            this.props.currentStatus('listening');

            this.setState({ listening: true });

            try {
                if (!this.listening) {
                    this.recognition.start();
                    this.listening = true;
                }
            } catch{ }


        }


    };


    //-----------------------------

    render() {

        return (

            <div id="inputArea">

                <MdMic id="voiceInputButton" onClick={this.startListening} style={{ color: this.state.listening ? 'grey' : 'white' }} />

            </div>


        );

    }


}