'use client';

    }
  }

  function goBack() {
    if (index === 0) return;
    setAnswers(answers.slice(0, -1));
    setIndex(index - 1);
  }

  function retake() {
    setProfile(null);
    localStorage.removeItem(STORAGE_KEY);
    startQuiz();
  }

  return (

  );
}