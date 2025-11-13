import { useState, useEffect } from "react";
import { auth, db } from "./firebase";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  collection,
  addDoc,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";

export default function App() {
  const [user, setUser] = useState(null);
  const [flashcards, setFlashcards] = useState([]);

  // Auth inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Flashcard inputs
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  // Mode test
  const [testMode, setTestMode] = useState(false);
  const [showAnswerId, setShowAnswerId] = useState(null);

  // Vérifie l'utilisateur + récupère ses cartes
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);

      if (u) {
        const q = query(
          collection(db, "flashcards"),
          where("uid", "==", u.uid)
        );

        onSnapshot(q, (snap) => {
          const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          setFlashcards(docs);
        });
      } else {
        setFlashcards([]);
      }
    });

    return () => unsub();
  }, []);

  // LOGIN
  const handleLogin = async () => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  // SIGNUP
  const handleSignup = async () => {
    await createUserWithEmailAndPassword(auth, email, password);
  };

  // LOGOUT
  const handleLogout = () => signOut(auth);

  // AJOUT FLASHCARD
  const addFlashcard = async () => {
    if (!question.trim() || !answer.trim()) return;

    await addDoc(collection(db, "flashcards"), {
      uid: user.uid,
      question,
      answer,
      createdAt: Date.now(),
    });

    setQuestion("");
    setAnswer("");
  };

  // EDIT FLASHCARD
  const editFlashcard = async (id, newQ, newA) => {
    const ref = doc(db, "flashcards", id);
    await updateDoc(ref, { question: newQ, answer: newA });
  };

  // DELETE FLASHCARD
  const deleteFlashcard = async (id) => {
    const ref = doc(db, "flashcards", id);
    await deleteDoc(ref);
  };

  // ------------------------------------------------------
  // UI
  // ------------------------------------------------------

  // Pas connecté
  if (!user) {
    return (
      <div style={{ padding: 30 }}>
        <h2>Connexion</h2>

        <input
          type="email"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        /><br/>

        <input
          type="password"
          placeholder="Mot de passe"
          onChange={(e) => setPassword(e.target.value)}
        /><br/><br/>

        <button onClick={handleLogin}>Se connecter</button>
        <button onClick={handleSignup} style={{ marginLeft: 10 }}>
          Créer un compte
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: 30 }}>
      <h2>Mes Flashcards</h2>

      <button onClick={handleLogout}>Déconnexion</button>
      <button
        onClick={() => setTestMode(!testMode)}
        style={{ marginLeft: 10 }}
      >
        {testMode ? "Quitter mode test" : "Mode test"}
      </button>

      <br /><br />

      {/* AJOUT */}
      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />{" "}
        <input
          type="text"
          placeholder="Réponse"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
        />{" "}
        <button onClick={addFlashcard}>Ajouter</button>
      </div>

      {/* AFFICHAGE */}
      <div>
        {flashcards.map((f) => (
          <FlashcardItem
            key={f.id}
            data={f}
            testMode={testMode}
            showAnswerId={showAnswerId}
            setShowAnswerId={setShowAnswerId}
            editFlashcard={editFlashcard}
            deleteFlashcard={deleteFlashcard}
          />
        ))}
      </div>
    </div>
  );
}

// ------------------------------------------------------
// Composant pour une flashcard
// ------------------------------------------------------
function FlashcardItem({
  data,
  testMode,
  showAnswerId,
  setShowAnswerId,
  editFlashcard,
  deleteFlashcard,
}) {
  const [editQ, setEditQ] = useState(data.question);
  const [editA, setEditA] = useState(data.answer);
  const [editing, setEditing] = useState(false);

  return (
    <div
      style={{
        border: "1px solid #ddd",
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        background: "#fafafa",
      }}
    >
      {/* MODE TEST */}
      {testMode ? (
        <div onClick={() => setShowAnswerId(data.id)}>
          <strong>Q : {data.question}</strong>
          {showAnswerId === data.id && (
            <p style={{ marginTop: 10 }}>R : {data.answer}</p>
          )}
        </div>
      ) : (
        <>
          {editing ? (
            <>
              <input
                value={editQ}
                onChange={(e) => setEditQ(e.target.value)}
              />
              <input
                value={editA}
                onChange={(e) => setEditA(e.target.value)}
              />
              <button
                onClick={() => {
                  editFlashcard(data.id, editQ, editA);
                  setEditing(false);
                }}
              >
                Sauvegarder
              </button>
            </>
          ) : (
            <>
              <strong>Q : {data.question}</strong>
              <p>R : {data.answer}</p>

              <button onClick={() => setEditing(true)}>Modifier</button>
              <button
                style={{ marginLeft: 10, color: "red" }}
                onClick={() => deleteFlashcard(data.id)}
              >
                Supprimer
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
}
