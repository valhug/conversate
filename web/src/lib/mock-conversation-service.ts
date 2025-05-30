import { ConversationRequest, ConversationResponse, ConversationMessage, LanguageCode, VocabularyWord } from '@conversate/shared';
import { v4 as uuidv4 } from 'uuid';

class MockConversationService {
  private conversationHistory: Map<string, ConversationMessage[]> = new Map();

  async generateResponse(request: ConversationRequest): Promise<ConversationResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    const sessionId = request.sessionId || uuidv4();
    const conversationId = request.conversationId || uuidv4();
    
    // Get conversation history
    const historyKey = `${conversationId}-${sessionId}`;
    const history = this.conversationHistory.get(historyKey) || [];
      // Add user message to history
    const userMessage: ConversationMessage = {
      id: uuidv4(),
      sessionId: sessionId,
      speaker: 'user',
      content: request.message,
      timestamp: new Date(),
    };
    history.push(userMessage);
    
    // Generate mock AI response based on language, level, and topic
    const aiResponseContent = this.generateMockResponse(
      request.message,
      request.language,
      request.cefrLevel,
      request.topic,
      history.length
    );
      // Add AI response to history
    const aiMessage: ConversationMessage = {
      id: uuidv4(),
      sessionId: sessionId,
      speaker: 'ai',
      content: aiResponseContent,
      timestamp: new Date(),
    };
    history.push(aiMessage);
    
    // Update conversation history
    this.conversationHistory.set(historyKey, history);
    
    // Extract vocabulary words
    const vocabularyWords = this.extractVocabulary(aiResponseContent, request.language);
    
    return {
      message: aiResponseContent,
      conversationId,
      sessionId,
      vocabularyWords,
      suggestions: this.generateSuggestions(request.cefrLevel),
    };
  }
  private generateMockResponse(
    userMessage: string,
    language: LanguageCode,
    level: string,
    topic?: string,
    messageCount?: number
  ): string {
    const isFirstMessage = messageCount === 1;
    
    // Mock responses by language, level, and topic
    const responses = this.getMockResponses(language, level, topic);
    
    if (isFirstMessage) {
      return responses.greetings[Math.floor(Math.random() * responses.greetings.length)];
    }
    
    // Enhanced keyword-based response selection with topic awareness
    const lowerMessage = userMessage.toLowerCase();
    
    // Greeting patterns
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hola') || 
        lowerMessage.includes('bonjour') || lowerMessage.includes('kumusta')) {
      return responses.greetings[Math.floor(Math.random() * responses.greetings.length)];
    }
    
    // Feelings and wellbeing
    if (lowerMessage.includes('how are') || lowerMessage.includes('como estas') || 
        lowerMessage.includes('comment allez') || lowerMessage.includes('kamusta')) {
      return responses.feelings[Math.floor(Math.random() * responses.feelings.length)];
    }
    
    // Topic-specific responses based on conversation topic
    if (topic === 'daily_life' || lowerMessage.includes('daily') || lowerMessage.includes('routine')) {
      return responses.dailyLife[Math.floor(Math.random() * responses.dailyLife.length)];
    }
    
    if (topic === 'business' || lowerMessage.includes('business') || lowerMessage.includes('meeting') || 
        lowerMessage.includes('work') || lowerMessage.includes('job') || lowerMessage.includes('trabajo')) {
      return responses.business[Math.floor(Math.random() * responses.business.length)];
    }
    
    if (topic === 'travel' || lowerMessage.includes('travel') || lowerMessage.includes('trip') || 
        lowerMessage.includes('vacation') || lowerMessage.includes('viaje')) {
      return responses.travel[Math.floor(Math.random() * responses.travel.length)];
    }
    
    if (topic === 'food' || lowerMessage.includes('food') || lowerMessage.includes('eat') || 
        lowerMessage.includes('comida') || lowerMessage.includes('cuisine')) {
      return responses.food[Math.floor(Math.random() * responses.food.length)];
    }
    
    if (topic === 'culture' || lowerMessage.includes('culture') || lowerMessage.includes('tradition') || 
        lowerMessage.includes('festival') || lowerMessage.includes('cultura')) {
      return responses.culture[Math.floor(Math.random() * responses.culture.length)];
    }
    
    if (topic === 'education' || lowerMessage.includes('school') || lowerMessage.includes('study') || 
        lowerMessage.includes('learn') || lowerMessage.includes('educacion')) {
      return responses.education[Math.floor(Math.random() * responses.education.length)];
    }
    
    if (topic === 'health' || lowerMessage.includes('health') || lowerMessage.includes('doctor') || 
        lowerMessage.includes('exercise') || lowerMessage.includes('salud')) {
      return responses.health[Math.floor(Math.random() * responses.health.length)];
    }
    
    if (topic === 'technology' || lowerMessage.includes('technology') || lowerMessage.includes('computer') || 
        lowerMessage.includes('internet') || lowerMessage.includes('tecnologia')) {
      return responses.technology[Math.floor(Math.random() * responses.technology.length)];
    }
    
    if (topic === 'entertainment' || lowerMessage.includes('movie') || lowerMessage.includes('music') || 
        lowerMessage.includes('game') || lowerMessage.includes('entretenimiento')) {
      return responses.entertainment[Math.floor(Math.random() * responses.entertainment.length)];
    }
    
    if (topic === 'family' || lowerMessage.includes('family') || lowerMessage.includes('familia') || 
        lowerMessage.includes('parent') || lowerMessage.includes('children')) {
      return responses.family[Math.floor(Math.random() * responses.family.length)];
    }
    
    // Fallback to general responses
    return responses.general[Math.floor(Math.random() * responses.general.length)];
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private getMockResponses(language: LanguageCode, level: string, _topic?: string) {
    const isBasicLevel = level === 'A1' || level === 'A2';
    
    switch (language) {
      case 'es':
        return this.getSpanishResponses(isBasicLevel);
      case 'fr':
        return this.getFrenchResponses(isBasicLevel);
      case 'tl':
        return this.getTagalogResponses(isBasicLevel);
      default:
        return this.getEnglishResponses(isBasicLevel);
    }
  }
  private getEnglishResponses(isBasic: boolean) {
    if (isBasic) {
      return {
        greetings: [
          'Hello! Nice to meet you. How are you today?',
          'Hi there! I\'m happy to practice English with you.',
          'Good day! What would you like to talk about?',
          'Welcome! I\'m excited to help you practice English.',
        ],
        feelings: [
          'I\'m doing well, thank you! How about you?',
          'I\'m fine! What did you do today?',
          'I\'m good! Tell me about your day.',
          'I feel great! How are you feeling?',
        ],
        dailyLife: [
          'What time do you wake up in the morning?',
          'Do you drink coffee or tea?',
          'How do you go to work or school?',
          'What do you do after work?',
          'Tell me about your morning routine.',
        ],
        business: [
          'Do you work in an office?',
          'What is your job?',
          'Do you like your work?',
          'How many people work with you?',
          'What time do you start work?',
        ],
        travel: [
          'Do you like to travel?',
          'Where do you want to go?',
          'How do you travel - by car or plane?',
          'What places have you visited?',
          'Do you like hotels or staying with friends?',
        ],
        food: [
          'I love food too! What\'s your favorite dish?',
          'That sounds delicious! Do you like to cook?',
          'Food is great! What did you eat today?',
          'Do you like spicy food?',
          'What do you eat for breakfast?',
        ],
        culture: [
          'What holidays do you celebrate?',
          'Tell me about your country\'s traditions.',
          'Do you like music from your country?',
          'What is special about your culture?',
          'Do you speak other languages?',
        ],
        education: [
          'Did you go to university?',
          'What did you study in school?',
          'Do you like learning new things?',
          'How do you practice English?',
          'What subjects do you find interesting?',
        ],
        health: [
          'Do you exercise every day?',
          'What do you do to stay healthy?',
          'Do you go to the doctor often?',
          'How many hours do you sleep?',
          'Do you walk or run for exercise?',
        ],
        technology: [
          'Do you use a smartphone?',
          'How often do you use the internet?',
          'Do you like computer games?',
          'What apps do you use most?',
          'Is technology helpful for learning?',
        ],
        entertainment: [
          'What movies do you like?',
          'Do you listen to music?',
          'What do you do for fun?',
          'Do you watch TV shows?',
          'Do you play any games?',
        ],
        family: [
          'That\'s nice! Do you have brothers or sisters?',
          'Family is important. Where does your family live?',
          'Tell me more about your family.',
          'How many people are in your family?',
          'Do you live with your parents?',
        ],
        general: [
          'That\'s interesting! Can you tell me more?',
          'I see! What do you think about that?',
          'That sounds good! What else?',
          'Really? How do you feel about it?',
          'That\'s nice! Why do you like it?',
        ],
      };
    } else {
      return {
        greetings: [
          'Hello! I\'m delighted to have this conversation with you. What topic interests you today?',
          'Greetings! I\'m looking forward to our discussion. What would you like to explore?',
          'Good to meet you! I\'m here to help you practice. What shall we discuss?',
          'Welcome! I\'m thrilled to engage in meaningful dialogue with you.',
        ],
        feelings: [
          'I\'m doing wonderfully, thank you for asking! How has your day been treating you?',
          'I\'m in excellent spirits today! What\'s been happening in your world?',
          'I\'m doing quite well, thanks! What experiences have you had recently?',
          'I\'m feeling fantastic! What emotions have you been experiencing lately?',
        ],
        dailyLife: [
          'Daily routines reveal so much about our priorities. How do you structure your typical day?',
          'I find daily habits fascinating. What rituals or routines anchor your daily life?',
          'The rhythm of daily life varies so much between cultures. How does your day typically unfold?',
          'Everyday experiences often hold profound meaning. What aspects of your daily routine bring you joy?',
        ],
        business: [
          'Professional life can be quite fulfilling. What aspects of your work do you find most rewarding?',
          'Career paths are so diverse these days. How did you choose your profession?',
          'That\'s a compelling field! What challenges and opportunities do you encounter?',
          'The business world is constantly evolving. How do you adapt to changes in your industry?',
        ],
        travel: [
          'Travel opens our minds to new perspectives. What destinations have left the deepest impression on you?',
          'Exploring new places enriches our understanding. How has travel influenced your worldview?',
          'Different cultures offer unique insights. What cultural discoveries have surprised you while traveling?',
          'The journey often matters as much as the destination. What travel experiences have been most transformative?',
        ],
        food: [
          'Culinary experiences are so rich! What flavors or cooking styles do you gravitate toward?',
          'Food culture is fascinating! How does cuisine reflect your heritage?',
          'That sounds absolutely delicious! What\'s the story behind that dish?',
          'Gastronomy connects us to culture and memory. What foods evoke special memories for you?',
        ],
        culture: [
          'Cultural traditions preserve our collective wisdom. What customs from your heritage do you cherish most?',
          'Art and culture reflect the soul of a society. How do cultural expressions influence your daily life?',
          'Cultural exchange enriches our understanding. What aspects of other cultures intrigue you?',
          'Traditional practices often carry profound meaning. Which cultural celebrations hold special significance for you?',
        ],
        education: [
          'Learning is a lifelong journey. What subjects or skills are you passionate about developing?',
          'Education shapes our perspectives profoundly. How has your learning journey influenced your thinking?',
          'Knowledge acquisition takes many forms. What learning methods work best for you?',
          'Academic pursuits can be deeply rewarding. What educational experiences have been most impactful?',
        ],
        health: [
          'Wellness encompasses both physical and mental wellbeing. How do you maintain balance in your life?',
          'Health consciousness is increasingly important. What practices contribute to your overall wellness?',
          'The mind-body connection is fascinating. How do you nurture both mental and physical health?',
          'Preventive care is essential for long-term wellness. What health strategies do you prioritize?',
        ],
        technology: [
          'Technology reshapes our world constantly. How do you balance digital engagement with offline experiences?',
          'Innovation drives societal change. What technological developments excite or concern you?',
          'Digital tools can enhance learning significantly. How has technology influenced your educational journey?',
          'The digital age presents both opportunities and challenges. How do you navigate this landscape?',
        ],
        entertainment: [
          'Creative expression takes countless forms. What artistic mediums resonate most deeply with you?',
          'Entertainment reflects and shapes cultural values. How do your preferences influence your worldview?',
          'Storytelling is fundamental to human experience. What narratives have profoundly impacted you?',
          'Recreational activities provide essential balance. How do you choose to spend your leisure time?',
        ],
        family: [
          'Family relationships are fascinating. How would you describe your family dynamics?',
          'That\'s wonderful! What role does family play in your cultural background?',
          'Family bonds are so important. How do you maintain close relationships?',
          'Intergenerational connections offer unique wisdom. What have you learned from different family members?',
        ],
        general: [
          'That\'s a thought-provoking perspective! Could you elaborate on your reasoning?',
          'I find that quite intriguing. What led you to that conclusion?',
          'That raises interesting questions. How do you think others might view this differently?',
          'Your insights are valuable. What experiences have shaped this viewpoint?',
        ],
      };
    }
  }
  private getSpanishResponses(isBasic: boolean) {
    if (isBasic) {
      return {
        greetings: [
          '¡Hola! Me alegra conocerte. ¿Cómo estás hoy?',
          '¡Hola! Estoy feliz de practicar español contigo.',
          '¡Buenos días! ¿De qué te gustaría hablar?',
          '¡Bienvenido! Me emociona ayudarte a practicar español.',
        ],
        feelings: [
          '¡Estoy bien, gracias! ¿Y tú cómo estás?',
          '¡Estoy muy bien! ¿Qué hiciste hoy?',
          '¡Estoy bien! Cuéntame sobre tu día.',
          '¡Me siento genial! ¿Cómo te sientes?',
        ],
        dailyLife: [
          '¿A qué hora te levantas por la mañana?',
          '¿Tomas café o té?',
          '¿Cómo vas al trabajo o a la escuela?',
          '¿Qué haces después del trabajo?',
          'Háblame de tu rutina matutina.',
        ],
        business: [
          '¿Trabajas en una oficina?',
          '¿Cuál es tu trabajo?',
          '¿Te gusta tu trabajo?',
          '¿Cuántas personas trabajan contigo?',
          '¿A qué hora empiezas a trabajar?',
        ],
        travel: [
          '¿Te gusta viajar?',
          '¿A dónde quieres ir?',
          '¿Cómo viajas - en coche o en avión?',
          '¿Qué lugares has visitado?',
          '¿Te gustan los hoteles o quedarte con amigos?',
        ],
        food: [
          '¡A mí también me gusta la comida! ¿Cuál es tu plato favorito?',
          '¡Suena delicioso! ¿Te gusta cocinar?',
          '¡La comida es genial! ¿Qué comiste hoy?',
          '¿Te gusta la comida picante?',
          '¿Qué desayunas?',
        ],
        culture: [
          '¿Qué fiestas celebras?',
          'Háblame de las tradiciones de tu país.',
          '¿Te gusta la música de tu país?',
          '¿Qué es especial de tu cultura?',
          '¿Hablas otros idiomas?',
        ],
        education: [
          '¿Fuiste a la universidad?',
          '¿Qué estudiaste en la escuela?',
          '¿Te gusta aprender cosas nuevas?',
          '¿Cómo practicas español?',
          '¿Qué materias te parecen interesantes?',
        ],
        health: [
          '¿Haces ejercicio todos los días?',
          '¿Qué haces para mantenerte saludable?',
          '¿Vas al médico frecuentemente?',
          '¿Cuántas horas duermes?',
          '¿Caminas o corres para hacer ejercicio?',
        ],
        technology: [
          '¿Usas un teléfono inteligente?',
          '¿Con qué frecuencia usas internet?',
          '¿Te gustan los juegos de computadora?',
          '¿Qué aplicaciones usas más?',
          '¿La tecnología ayuda a aprender?',
        ],
        entertainment: [
          '¿Qué películas te gustan?',
          '¿Escuchas música?',
          '¿Qué haces para divertirte?',
          '¿Ves programas de televisión?',
          '¿Juegas algún juego?',
        ],
        family: [
          '¡Qué bueno! ¿Tienes hermanos o hermanas?',
          'La familia es importante. ¿Dónde vive tu familia?',
          'Cuéntame más sobre tu familia.',
          '¿Cuántas personas hay en tu familia?',
          '¿Vives con tus padres?',
        ],
        general: [
          '¡Qué interesante! ¿Puedes contarme más?',
          '¡Ya veo! ¿Qué piensas sobre eso?',
          '¡Suena bien! ¿Qué más?',
          '¿En serio? ¿Cómo te sientes al respecto?',
          '¡Qué bien! ¿Por qué te gusta?',
        ],
      };
    } else {
      return {
        greetings: [
          '¡Hola! Me encanta tener esta conversación contigo. ¿Qué tema te interesa hoy?',
          '¡Saludos! Espero con interés nuestra charla. ¿Qué te gustaría explorar?',
          '¡Mucho gusto conocerte! Estoy aquí para ayudarte a practicar. ¿De qué hablamos?',
          '¡Bienvenido! Me emociona participar en un diálogo significativo contigo.',
        ],
        feelings: [
          '¡Me va de maravilla, gracias por preguntar! ¿Cómo ha estado tu día?',
          '¡Tengo un excelente ánimo hoy! ¿Qué ha estado pasando en tu mundo?',
          '¡Me va bastante bien, gracias! ¿Qué experiencias has tenido recientemente?',
          '¡Me siento fantástico! ¿Qué emociones has estado experimentando últimamente?',
        ],
        dailyLife: [
          'Las rutinas diarias revelan mucho sobre nuestras prioridades. ¿Cómo estructuras tu día típico?',
          'Los hábitos diarios me resultan fascinantes. ¿Qué rituales o rutinas anclan tu vida diaria?',
          'El ritmo de la vida diaria varía mucho entre culturas. ¿Cómo se desarrolla típicamente tu día?',
          'Las experiencias cotidianas a menudo tienen significado profundo. ¿Qué aspectos de tu rutina diaria te traen alegría?',
        ],
        business: [
          'La vida profesional puede ser muy satisfactoria. ¿Qué aspectos de tu trabajo encuentras más gratificantes?',
          'Las trayectorias profesionales son tan diversas hoy en día. ¿Cómo elegiste tu profesión?',
          '¡Es un campo fascinante! ¿Qué desafíos y oportunidades encuentras?',
          'El mundo empresarial está en constante evolución. ¿Cómo te adaptas a los cambios en tu industria?',
        ],
        travel: [
          'Los viajes abren nuestras mentes a nuevas perspectivas. ¿Qué destinos han dejado la impresión más profunda en ti?',
          'Explorar nuevos lugares enriquece nuestra comprensión. ¿Cómo ha influido el viaje en tu visión del mundo?',
          'Las diferentes culturas ofrecen perspectivas únicas. ¿Qué descubrimientos culturales te han sorprendido al viajar?',
          'El viaje a menudo importa tanto como el destino. ¿Qué experiencias de viaje han sido más transformadoras?',
        ],
        food: [
          '¡Las experiencias culinarias son tan ricas! ¿Hacia qué sabores o estilos de cocina gravitas?',
          '¡La cultura gastronómica es fascinante! ¿Cómo refleja la cocina tu herencia?',
          '¡Suena absolutamente delicioso! ¿Cuál es la historia detrás de ese plato?',
          'La gastronomía nos conecta con la cultura y la memoria. ¿Qué comidas evocan recuerdos especiales para ti?',
        ],
        culture: [
          'Las tradiciones culturales preservan nuestra sabiduría colectiva. ¿Qué costumbres de tu herencia aprecias más?',
          'El arte y la cultura reflejan el alma de una sociedad. ¿Cómo influyen las expresiones culturales en tu vida diaria?',
          'El intercambio cultural enriquece nuestra comprensión. ¿Qué aspectos de otras culturas te intrigan?',
          'Las prácticas tradicionales a menudo tienen significado profundo. ¿Qué celebraciones culturales tienen especial significado para ti?',
        ],
        education: [
          'El aprendizaje es un viaje de por vida. ¿Qué materias o habilidades te apasiona desarrollar?',
          'La educación moldea profundamente nuestras perspectivas. ¿Cómo ha influido tu viaje de aprendizaje en tu pensamiento?',
          'La adquisición de conocimiento toma muchas formas. ¿Qué métodos de aprendizaje funcionan mejor para ti?',
          'Las actividades académicas pueden ser profundamente gratificantes. ¿Qué experiencias educativas han sido más impactantes?',
        ],
        health: [
          'El bienestar abarca tanto el bienestar físico como mental. ¿Cómo mantienes el equilibrio en tu vida?',
          'La conciencia de la salud es cada vez más importante. ¿Qué prácticas contribuyen a tu bienestar general?',
          'La conexión mente-cuerpo es fascinante. ¿Cómo nutres tanto la salud mental como física?',
          'El cuidado preventivo es esencial para el bienestar a largo plazo. ¿Qué estrategias de salud priorizas?',
        ],
        technology: [
          'La tecnología remodela nuestro mundo constantemente. ¿Cómo equilibras el compromiso digital con las experiencias offline?',
          'La innovación impulsa el cambio social. ¿Qué desarrollos tecnológicos te emocionan o preocupan?',
          'Las herramientas digitales pueden mejorar significativamente el aprendizaje. ¿Cómo ha influido la tecnología en tu viaje educativo?',
          'La era digital presenta tanto oportunidades como desafíos. ¿Cómo navegas este panorama?',
        ],
        entertainment: [
          'La expresión creativa toma innumerables formas. ¿Qué medios artísticos resuenan más profundamente contigo?',
          'El entretenimiento refleja y moldea los valores culturales. ¿Cómo influyen tus preferencias en tu visión del mundo?',
          'La narración es fundamental para la experiencia humana. ¿Qué narrativas te han impactado profundamente?',
          'Las actividades recreativas proporcionan equilibrio esencial. ¿Cómo eliges pasar tu tiempo libre?',
        ],
        family: [
          'Las relaciones familiares son fascinantes. ¿Cómo describirías las dinámicas de tu familia?',
          '¡Qué maravilloso! ¿Qué papel juega la familia en tu trasfondo cultural?',
          'Los lazos familiares son tan importantes. ¿Cómo mantienes relaciones cercanas?',          'Las conexiones intergeneracionales ofrecen sabiduría única. ¿Qué has aprendido de diferentes miembros de la familia?',
        ],
        general: [
          '¡Es una perspectiva que invita a la reflexión! ¿Podrías elaborar sobre tu razonamiento?',
          'Encuentro eso bastante intrigante. ¿Qué te llevó a esa conclusión?',
          'Eso plantea preguntas interesantes. ¿Cómo crees que otros podrían ver esto de manera diferente?',
          'Tus ideas son valiosas. ¿Qué experiencias han moldeado este punto de vista?',
        ],
      };
    }
  }
  private getFrenchResponses(isBasic: boolean) {
    if (isBasic) {
      return {
        greetings: [
          'Bonjour ! Je suis content de vous rencontrer. Comment allez-vous aujourd\'hui ?',
          'Salut ! Je suis heureux de pratiquer le français avec vous.',
          'Bonne journée ! De quoi aimeriez-vous parler ?',
          'Bienvenue ! Je suis ravi de vous aider à pratiquer le français.',
        ],
        feelings: [
          'Je vais bien, merci ! Et vous, comment allez-vous ?',
          'Je vais très bien ! Qu\'avez-vous fait aujourd\'hui ?',
          'Je vais bien ! Parlez-moi de votre journée.',
          'Je me sens bien ! Comment vous sentez-vous ?',
        ],
        dailyLife: [
          'À quelle heure vous levez-vous le matin ?',
          'Buvez-vous du café ou du thé ?',
          'Comment allez-vous au travail ou à l\'école ?',
          'Que faites-vous après le travail ?',
          'Parlez-moi de votre routine matinale.',
        ],
        business: [
          'Travaillez-vous dans un bureau ?',
          'Quel est votre travail ?',
          'Aimez-vous votre travail ?',
          'Combien de personnes travaillent avec vous ?',
          'À quelle heure commencez-vous le travail ?',
        ],
        travel: [
          'Aimez-vous voyager ?',
          'Où voulez-vous aller ?',
          'Comment voyagez-vous - en voiture ou en avion ?',
          'Quels endroits avez-vous visités ?',
          'Aimez-vous les hôtels ou rester chez des amis ?',
        ],
        food: [
          'J\'aime aussi la nourriture ! Quel est votre plat préféré ?',
          'Ça sonne délicieux ! Aimez-vous cuisiner ?',
          'La nourriture est fantastique ! Qu\'avez-vous mangé aujourd\'hui ?',
          'Aimez-vous la nourriture épicée ?',
          'Que prenez-vous au petit-déjeuner ?',
        ],
        culture: [
          'Quelles fêtes célébrez-vous ?',
          'Parlez-moi des traditions de votre pays.',
          'Aimez-vous la musique de votre pays ?',
          'Qu\'est-ce qui est spécial dans votre culture ?',
          'Parlez-vous d\'autres langues ?',
        ],
        education: [
          'Êtes-vous allé à l\'université ?',
          'Qu\'avez-vous étudié à l\'école ?',
          'Aimez-vous apprendre de nouvelles choses ?',
          'Comment pratiquez-vous le français ?',
          'Quelles matières trouvez-vous intéressantes ?',
        ],
        health: [
          'Faites-vous de l\'exercice tous les jours ?',
          'Que faites-vous pour rester en bonne santé ?',
          'Allez-vous souvent chez le médecin ?',
          'Combien d\'heures dormez-vous ?',
          'Marchez-vous ou courez-vous pour faire de l\'exercice ?',
        ],
        technology: [
          'Utilisez-vous un smartphone ?',
          'À quelle fréquence utilisez-vous internet ?',
          'Aimez-vous les jeux vidéo ?',
          'Quelles applications utilisez-vous le plus ?',
          'La technologie aide-t-elle à apprendre ?',
        ],
        entertainment: [
          'Quels films aimez-vous ?',
          'Écoutez-vous de la musique ?',
          'Que faites-vous pour vous amuser ?',
          'Regardez-vous des émissions de télévision ?',
          'Jouez-vous à des jeux ?',
        ],
        family: [
          'C\'est bien ! Avez-vous des frères ou des sœurs ?',
          'La famille est importante. Où habite votre famille ?',
          'Parlez-moi plus de votre famille.',
          'Combien de personnes y a-t-il dans votre famille ?',
          'Vivez-vous avec vos parents ?',
        ],
        general: [
          'C\'est intéressant ! Pouvez-vous m\'en dire plus ?',
          'Je vois ! Qu\'en pensez-vous ?',
          'Ça sonne bien ! Quoi d\'autre ?',
          'Vraiment ? Comment vous sentez-vous à ce sujet ?',
          'C\'est bien ! Pourquoi aimez-vous cela ?',
        ],
      };
    } else {
      return {
        greetings: [
          'Bonjour ! Je suis ravi d\'avoir cette conversation avec vous. Quel sujet vous intéresse aujourd\'hui ?',
          'Salutations ! J\'attends avec impatience notre discussion. Qu\'aimeriez-vous explorer ?',
          'Enchanté de vous rencontrer ! Je suis là pour vous aider à pratiquer. De quoi devons-nous discuter ?',
          'Bienvenue ! Je suis ravi de participer à un dialogue significatif avec vous.',
        ],
        feelings: [
          'Je vais à merveille, merci de demander ! Comment s\'est passée votre journée ?',
          'Je suis d\'excellente humeur aujourd\'hui ! Que se passe-t-il dans votre monde ?',
          'Je vais très bien, merci ! Quelles expériences avez-vous eues récemment ?',
          'Je me sens fantastique ! Quelles émotions avez-vous ressenties dernièrement ?',
        ],
        dailyLife: [
          'Les routines quotidiennes révèlent beaucoup sur nos priorités. Comment structurez-vous votre journée type ?',
          'Les habitudes quotidiennes me fascinent. Quels rituels ou routines ancrent votre vie quotidienne ?',
          'Le rythme de la vie quotidienne varie tant entre les cultures. Comment se déroule typiquement votre journée ?',
          'Les expériences quotidiennes portent souvent un sens profond. Quels aspects de votre routine quotidienne vous apportent de la joie ?',
        ],
        business: [
          'La vie professionnelle peut être très épanouissante. Quels aspects de votre travail trouvez-vous les plus gratifiants ?',
          'Les parcours de carrière sont si divers de nos jours. Comment avez-vous choisi votre profession ?',
          'C\'est un domaine fascinant ! Quels défis et opportunités rencontrez-vous ?',
          'Le monde des affaires évolue constamment. Comment vous adaptez-vous aux changements dans votre industrie ?',
        ],
        travel: [
          'Les voyages ouvrent nos esprits à de nouvelles perspectives. Quelles destinations ont laissé l\'impression la plus profonde sur vous ?',
          'Explorer de nouveaux endroits enrichit notre compréhension. Comment les voyages ont-ils influencé votre vision du monde ?',
          'Les différentes cultures offrent des perspectives uniques. Quelles découvertes culturelles vous ont surpris en voyageant ?',
          'Le voyage compte souvent autant que la destination. Quelles expériences de voyage ont été les plus transformatrices ?',
        ],
        food: [
          'Les expériences culinaires sont si riches ! Vers quelles saveurs ou styles de cuisine gravitez-vous ?',
          'La culture gastronomique est fascinante ! Comment la cuisine reflète-t-elle votre héritage ?',
          'Ça sonne absolument délicieux ! Quelle est l\'histoire derrière ce plat ?',
          'La gastronomie nous connecte à la culture et à la mémoire. Quels aliments évoquent des souvenirs spéciaux pour vous ?',
        ],
        culture: [
          'Les traditions culturelles préservent notre sagesse collective. Quelles coutumes de votre héritage chérissez-vous le plus ?',
          'L\'art et la culture reflètent l\'âme d\'une société. Comment les expressions culturelles influencent-elles votre vie quotidienne ?',
          'L\'échange culturel enrichit notre compréhension. Quels aspects d\'autres cultures vous intriguent ?',
          'Les pratiques traditionnelles portent souvent un sens profond. Quelles célébrations culturelles ont une signification spéciale pour vous ?',
        ],
        education: [
          'L\'apprentissage est un voyage de toute une vie. Quels sujets ou compétences vous passionnez-vous à développer ?',
          'L\'éducation façonne profondément nos perspectives. Comment votre parcours d\'apprentissage a-t-il influencé votre pensée ?',
          'L\'acquisition de connaissances prend de nombreuses formes. Quelles méthodes d\'apprentissage fonctionnent le mieux pour vous ?',
          'Les activités académiques peuvent être profondément gratifiantes. Quelles expériences éducatives ont été les plus marquantes ?',
        ],
        health: [
          'Le bien-être englobe à la fois le bien-être physique et mental. Comment maintenez-vous l\'équilibre dans votre vie ?',
          'La conscience de la santé devient de plus en plus importante. Quelles pratiques contribuent à votre bien-être général ?',
          'La connexion corps-esprit est fascinante. Comment nourrissez-vous à la fois la santé mentale et physique ?',
          'Les soins préventifs sont essentiels pour le bien-être à long terme. Quelles stratégies de santé priorisez-vous ?',
        ],
        technology: [
          'La technologie remodèle constamment notre monde. Comment équilibrez-vous l\'engagement numérique avec les expériences hors ligne ?',
          'L\'innovation stimule le changement sociétal. Quels développements technologiques vous excitent ou vous préoccupent ?',
          'Les outils numériques peuvent améliorer considérablement l\'apprentissage. Comment la technologie a-t-elle influencé votre parcours éducatif ?',
          'L\'ère numérique présente à la fois des opportunités et des défis. Comment naviguez-vous dans ce paysage ?',
        ],
        entertainment: [
          'L\'expression créative prend d\'innombrables formes. Quels médiums artistiques résonnent le plus profondément avec vous ?',
          'Le divertissement reflète et façonne les valeurs culturelles. Comment vos préférences influencent-elles votre vision du monde ?',
          'La narration est fondamentale à l\'expérience humaine. Quels récits vous ont profondément impacté ?',
          'Les activités récréatives offrent un équilibre essentiel. Comment choisissez-vous de passer votre temps libre ?',
        ],
        family: [
          'Les relations familiales sont fascinantes. Comment décririez-vous la dynamique de votre famille ?',
          'C\'est merveilleux ! Quel rôle joue la famille dans votre contexte culturel ?',
          'Les liens familiaux sont si importants. Comment maintenez-vous des relations proches ?',
          'Les connexions intergénérationnelles offrent une sagesse unique. Qu\'avez-vous appris de différents membres de la famille ?',
        ],
        general: [
          'C\'est une perspective très réfléchie ! Pourriez-vous élaborer sur votre raisonnement ?',
          'Je trouve cela assez intriguant. Qu\'est-ce qui vous a mené à cette conclusion ?',
          'Cela soulève des questions intéressantes. Comment pensez-vous que d\'autres pourraient voir cela différemment ?',
          'Vos idées sont précieuses. Quelles expériences ont façonné ce point de vue ?',
        ],
      };
    }
  }
  private getTagalogResponses(isBasic: boolean) {
    if (isBasic) {
      return {
        greetings: [
          'Kumusta! Masaya akong makilala ka. Kumusta ka ngayon?',
          'Hello! Masaya akong mag-practice ng Tagalog kasama mo.',
          'Magandang araw! Tungkol saan mo gustong mag-usap?',
          'Maligayang pagdating! Nasasabik akong tumulong sa iyo na mag-practice ng Tagalog.',
        ],
        feelings: [
          'Mabuti naman ako, salamat! Ikaw, kumusta ka?',
          'Mabuti ako! Ano ang ginawa mo ngayon?',
          'Ayos lang ako! Ikwento mo ang inyong araw.',
          'Masaya ako! Paano ka naman?',
        ],
        dailyLife: [
          'Anong oras ka bumabangon sa umaga?',
          'Umiinom ka ba ng kape o tsaa?',
          'Paano ka pumupunta sa trabaho o sa paaralan?',
          'Ano ang ginagawa mo pagkatapos ng trabaho?',
          'Ikwento mo ang inyong morning routine.',
        ],
        business: [
          'Nagtatrabaho ka ba sa opisina?',
          'Ano ang trabaho mo?',
          'Gusto mo ba ang trabaho mo?',
          'Ilan ang kasama mo sa trabaho?',
          'Anong oras ka nagsisimula ng trabaho?',
        ],
        travel: [
          'Gusto mo bang magtravel?',
          'Saan mo gustong pumunta?',
          'Paano ka naglalakbay - sa kotse o sa eroplano?',
          'Anong mga lugar na nabisita mo na?',
          'Gusto mo ba ng mga hotel o sa mga kaibigan?',
        ],
        food: [
          'Gusto ko rin ang pagkain! Ano ang paboritong ulam mo?',
          'Mukhang masarap! Marunong ka bang magluto?',
          'Maganda ang pagkain! Ano ang kinain mo ngayon?',
          'Gusto mo ba ng maanghang na pagkain?',
          'Ano ang kinakain mo sa agahan?',
        ],
        culture: [
          'Anong mga pista ang ginagawa ninyo?',
          'Ikwento mo ang mga tradisyon ng inyong bansa.',
          'Gusto mo ba ang musika ng inyong bansa?',
          'Ano ang espesyal sa inyong kultura?',
          'Nagsasalita ka ba ng ibang mga wika?',
        ],
        education: [
          'Nagtapos ka ba sa kolehiyo?',
          'Ano ang pinag-aralan mo sa paaralan?',
          'Gusto mo bang matuto ng mga bagong bagay?',
          'Paano ka nag-practice ng Tagalog?',
          'Anong mga subject ang interesante sa iyo?',
        ],
        health: [
          'Nag-eehersisyo ka ba araw-araw?',
          'Ano ang ginagawa mo para maging healthy?',
          'Pumupunta ka ba sa doktor madalas?',
          'Ilang oras ka natutulog?',
          'Naglalakad ka ba o tumatakbo para sa ehersisyo?',
        ],
        technology: [
          'Gumagamit ka ba ng smartphone?',
          'Gaano kadalas mo ginagamit ang internet?',
          'Gusto mo ba ng mga computer games?',
          'Anong mga apps ang pinakagamit mo?',
          'Nakakatulong ba ang technology sa pag-aaral?',
        ],
        entertainment: [
          'Anong mga pelikula ang gusto mo?',
          'Nakikinig ka ba ng musika?',
          'Ano ang ginagawa mo para mag-enjoy?',
          'Nanonood ka ba ng TV shows?',
          'Naglalaro ka ba ng mga games?',
        ],
        family: [
          'Ang ganda naman! May mga kapatid ka ba?',
          'Importante ang pamilya. Saan nakatira ang pamilya mo?',
          'Ikwento mo pa tungkol sa pamilya mo.',
          'Ilan ang miyembro ng pamilya mo?',
          'Nakatira ka ba kasama ng mga magulang mo?',
        ],
        general: [
          'Interesting! Pwede mo bang ikwento pa?',
          'Aha! Ano ang tingin mo dyan?',
          'Maganda yan! Ano pa?',
          'Talaga? Paano mo nararamdaman yun?',
          'Ayos yan! Bakit mo gusto yun?',
        ],
      };
    } else {
      return {
        greetings: [
          'Kumusta! Natutuwa akong makausap ka ngayon. Anong paksa ang interesado ka ngayon?',
          'Magandang pagbati! Inaasahan ko ang aming pag-uusap. Ano ang gusto mong tuklasin?',
          'Masaya kitang makilala! Nandito ako para tulungan kang mag-practice. Tungkol saan tayo mag-uusap?',
          'Maligayang pagdating! Nasasabik akong makipag-usap ng makabuluhan sa iyo.',
        ],
        feelings: [
          'Napakaganda ng pakiramdam ko, salamat sa pagtatanong! Kumusta naman ang inyong araw?',
          'Napakagandang mood ko ngayon! Ano ang nangyayari sa inyong mundo?',
          'Mabuti naman ako, salamat! Anong mga karanasan ang naranasan mo kamakailan?',
          'Napakasaya ko! Anong mga damdamin ang naramdaman mo nitong mga nakaraang araw?',
        ],
        dailyLife: [
          'Ang mga pang-araw-araw na gawain ay nagpapakita ng marami tungkol sa aming mga priyoridad. Paano mo iniorganisa ang inyong karaniwang araw?',
          'Nakakaakit sa akin ang mga pang-araw-araw na gawi. Anong mga ritwal o routine ang nagbibigay ng istraktura sa inyong buhay?',
          'Ang ritmo ng pang-araw-araw na buhay ay napakaiba sa iba\'t ibang kultura. Paano karaniwang umuusad ang inyong araw?',
          'Ang mga karanasang pang-araw-araw ay madalas na may malalim na kahulugan. Anong mga aspeto ng inyong routine na nagdudulot sa inyo ng kagalakan?',
        ],
        business: [
          'Ang propesyonal na buhay ay maaaring napakaginhawa. Anong mga aspeto ng inyong trabaho ang pinakakapaki-pakinabang sa inyo?',
          'Ang mga landas sa karera ay napakatiba ngayon. Paano ninyo napili ang inyong propesyon?',
          'Iyan ay nakakaakit na larangan! Anong mga hamon at pagkakataon ang inyong nararanasan?',
          'Ang mundo ng negosyo ay patuloy na umuunlad. Paano kayo sumasabay sa mga pagbabago sa inyong industriya?',
        ],
        travel: [
          'Ang paglalakbay ay nagbubukas ng aming mga isipan sa mga bagong pananaw. Anong mga destinasyon ang nag-iwan ng pinakamalalim na impresyon sa inyo?',
          'Ang paggagalugad ng mga bagong lugar ay nagpapayaman sa aming pag-unawa. Paano naimpluwensyahan ng paglalakbay ang inyong pananaw sa mundo?',
          'Ang iba\'t ibang kultura ay nag-aalok ng mga natatanging pananaw. Anong mga cultural discoveries ang nagulat sa inyo habang naglalakbay?',
          'Ang paglalakbay ay madalas na kasing halaga ng destinasyon. Anong mga karanasan sa paglalakbay ang naging pinakatransformative?',
        ],
        food: [
          'Napakayaman ng mga karanasang pangkulinarya! Anong mga lasa o estilo ng pagluluto ang hinahangaan ninyo?',
          'Nakakaakit ang kultura ng pagkain! Paano inirerepresenta ng lutuin ang inyong pamana?',
          'Mukhang napakasarap talaga! Ano ang kwento sa likod ng pagkaing iyan?',
          'Ang gastronomiya ay nag-uugnay sa amin sa kultura at alaala. Anong mga pagkain ang nag-uudyok ng mga espesyal na alaala para sa inyo?',
        ],
        culture: [
          'Ang mga tradisyong kultural ay nagiingat ng aming kolektibong karunungan. Anong mga kaugalian mula sa inyong pamana ang pinakamahahalagang sa inyo?',
          'Ang sining at kultura ay sumasalamin sa kaluluwa ng isang lipunan. Paano naiimpluwensyahan ng mga cultural expressions ang inyong pang-araw-araw na buhay?',
          'Ang palitan ng kultura ay nagpapayaman sa aming pag-unawa. Anong mga aspeto ng ibang kultura ang nakakaakit sa inyo?',
          'Ang mga tradisyonal na gawain ay madalas na may malalim na kahulugan. Anong mga pagdiriwang ng kultura ang may espesyal na kahulugan para sa inyo?',
        ],
        education: [
          'Ang pag-aaral ay isang paglalakbay habambuhay. Anong mga paksa o kakayahan ang ninyo gustong paunlarin?',
          'Ang edukasyon ay malalim na humuhubog sa aming mga pananaw. Paano naimpluwensyahan ng inyong paglalakbay sa pag-aaral ang inyong pag-iisip?',
          'Ang pagkuha ng kaalaman ay may maraming porma. Anong mga paraan ng pag-aaral ang pinakaeffective para sa inyo?',
          'Ang mga academic pursuits ay maaaring napakagantimpala. Anong mga karanasan sa edukasyon ang naging pinakamahalaga?',
        ],
        health: [
          'Ang wellness ay sumasaklaw sa physical at mental na wellbeing. Paano ninyo pinapanatili ang balanse sa inyong buhay?',
          'Ang kamalayan sa kalusugan ay lumalalong nagiging importante. Anong mga gawain ang nag-aambag sa inyong kabuuang wellness?',
          'Nakakaakit ang koneksyon ng isip at katawan. Paano ninyo pinangangalagaan ang parehong mental at physical na kalusugan?',
          'Ang preventive care ay mahalaga para sa pangmatagalang wellness. Anong mga estratehiya sa kalusugan ang pinag-uunahang pansin ninyo?',
        ],
        technology: [
          'Ang teknolohiya ay patuloy na muling humuhubog sa aming mundo. Paano ninyo pinalalansahe ang digital engagement sa mga offline na karanasan?',
          'Ang innovation ay nagtutulak ng pagbabago sa lipunan. Anong mga pag-unlad sa teknolohiya ang nakakaginhawa o nakakabahala sa inyo?',
          'Ang mga digital tools ay maaaring malaking pagpapabuti sa pag-aaral. Paano naimpluwensyahan ng teknolohiya ang inyong educational journey?',
          'Ang digital age ay naghahandog ng mga pagkakataon at hamon. Paano ninyo ninavigate ang landscape na ito?',
        ],
        entertainment: [
          'Ang creative expression ay may walang bilang na porma. Anong mga artistic mediums ang pinakamalalim na umaabot sa inyo?',
          'Ang entertainment ay sumasalamin at humuhubog sa mga values ng kultura. Paano naiimpluwensyahan ng inyong mga preference ang inyong worldview?',
          'Ang storytelling ay pangunahing bahagi ng karanasan ng tao. Anong mga narratives ang malalim na nag-impact sa inyo?',
          'Ang mga recreational activities ay nagbibigay ng mahalagang balanse. Paano ninyo pinipili na gamitin ang inyong free time?',
        ],
        family: [
          'Nakakaakit ang mga relasyon sa pamilya. Paano ninyo inilarawan ang dynamics ng inyong pamilya?',
          'Napakaganda naman! Anong papel ang ginagampanan ng pamilya sa inyong background ng kultura?',
          'Napakahalaga ng mga ugnayang pampamilya. Paano ninyo pinapanatili ang malapit na mga relasyon?',
          'Ang mga koneksyon ng magkakaibang henerasyon ay nag-aalok ng natatanging karunungan. Ano ang natutuhan ninyo mula sa iba\'t ibang miyembro ng pamilya?',
        ],
        general: [
          'Iyan ay isang mapag-isip na pananaw! Maaari ninyo bang palawakin ang inyong pangangatuwiran?',
          'Nakakaakit ko iyan. Ano ang nagtulak sa inyo sa konklusyon na iyan?',
          'Iyan ay nagtataas ng mga nakakaakit na tanong. Paano ninyo iniisip na maaaring tingnan ng ibang tao ito nang iba?',
          'Ang inyong mga ideya ay mahalaga. Anong mga karanasan ang humubog sa pananaw na ito?',
        ],
      };
    }
  }

  private extractVocabulary(text: string, language: LanguageCode): VocabularyWord[] {
    // Simple vocabulary extraction for mock service
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    const uniqueWords = [...new Set(words)];
    
    // Mock vocabulary based on language
    const sampleVocab: Record<LanguageCode, string[]> = {
      'en': ['interesting', 'wonderful', 'experience', 'important', 'delicious'],
      'es': ['interesante', 'maravilloso', 'experiencia', 'importante', 'delicioso'],
      'fr': ['intéressant', 'merveilleux', 'expérience', 'important', 'délicieux'],
      'tl': ['kawili-wili', 'maganda', 'karanasan', 'importante', 'masarap'],
    };
    
    const languageVocab = sampleVocab[language] || sampleVocab['en'];
    
    return uniqueWords
      .filter(word => word.length > 4 && languageVocab.some(v => text.includes(v)))
      .slice(0, 2)
      .map(word => ({
        word,
        translation: this.getMockTranslation(word, language),
        context: text,
        difficulty: 'medium',
        partOfSpeech: 'unknown',
      }));
  }

  private getMockTranslation(word: string, language: LanguageCode): string {
    // Simple mock translations
    const translations: Record<LanguageCode, Record<string, string>> = {
      'es': {
        'interesante': 'interesting',
        'maravilloso': 'wonderful',
        'importante': 'important',
        'delicioso': 'delicious',
      },
      'fr': {
        'intéressant': 'interesting',
        'merveilleux': 'wonderful',
        'important': 'important',
        'délicieux': 'delicious',
      },
      'tl': {
        'kawili-wili': 'interesting',
        'maganda': 'beautiful/wonderful',
        'importante': 'important',
        'masarap': 'delicious',
      },
      'en': {},
    };
    
    return translations[language]?.[word] || `Translation for "${word}"`;
  }

  private generateSuggestions(level: string): string[] {
    const suggestions: Record<string, string[]> = {
      'A1': [
        'Tell me about your family',
        'What do you like to eat?',
        'Where are you from?',
        'What is your hobby?',
      ],
      'A2': [
        'Describe your typical day',
        'What did you do last weekend?',
        'Tell me about your job or studies',
        'What are your plans for the future?',
      ],
      'B1': [
        'What do you think about this topic?',
        'Can you explain your opinion in more detail?',
        'How does this compare to your country?',
        'What would you do in this situation?',
      ],
      'B2': [
        'Let\'s discuss the pros and cons',
        'How has this changed over time?',
        'What are the implications of this?',
        'Can you analyze this from different perspectives?',
      ],
      'C1': [
        'Let\'s explore the nuances of this issue',
        'How would you argue for the opposing view?',
        'What are the underlying assumptions here?',
        'Can you elaborate on the complexities involved?',
      ],
      'C2': [
        'Let\'s examine the philosophical implications',
        'How does this reflect broader societal trends?',
        'What are the subtle distinctions we should consider?',
        'Can you articulate the most sophisticated counterargument?',
      ],
    };

    return suggestions[level] || suggestions['A1'];
  }
  async getConversationHistory(conversationId: string): Promise<ConversationMessage[]> {
    // For consistency with database services, only use conversationId
    // Create a default sessionId if needed
    const sessionId = 'mock-session';
    const historyKey = `${conversationId}-${sessionId}`;
    return this.conversationHistory.get(historyKey) || [];
  }

  async clearConversationHistory(conversationId: string): Promise<void> {
    // For consistency with database services, only use conversationId
    // Create a default sessionId if needed
    const sessionId = 'mock-session';
    const historyKey = `${conversationId}-${sessionId}`;
    this.conversationHistory.delete(historyKey);
  }
}

export const mockConversationService = new MockConversationService();