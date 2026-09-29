import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './AdminPanel.css';

const defaultSubjectImage = '/buhoPredeterminado.jpg';

const emptySubject = {
  name: '',
  description: '',
  image_url: '',
  icon: 'auto_stories',
  color: '#4d96ff',
  sort_order: 0,
  is_active: true,
};

const subjectIcons = [
  ['auto_stories', 'Lectura'],
  ['calculate', 'Matemáticas'],
  ['science', 'Ciencias'],
  ['potted_plant', 'Naturaleza'],
  ['palette', 'Arte'],
  ['music_note', 'Música'],
  ['language', 'Idiomas'],
  ['sports_esports', 'Juegos'],
  ['pets', 'Animales'],
  ['public', 'Mundo'],
  ['star', 'Estrellas'],
  ['lightbulb', 'Ideas'],
  ['rocket_launch', 'Exploración'],
  ['extension', 'Retos'],
  ['shapes', 'Figuras'],
  ['favorite', 'Bienestar'],
];

const subjectColors = [
  ['#4d96ff', 'Azul'],
  ['#ff6064', 'Coral'],
  ['#4ecb71', 'Verde'],
  ['#a66cff', 'Violeta'],
  ['#ff9f43', 'Naranja'],
  ['#23b8b2', 'Turquesa'],
  ['#f06292', 'Rosa'],
  ['#795548', 'Café'],
  ['#607d8b', 'Gris azulado'],
  ['#f2c230', 'Amarillo'],
];

const emptyActivity = (subjectId) => ({
  subject_id: subjectId,
  name: '',
  description: '',
  game_type: 'memorama',
  difficulty: 1,
  instructions: '',
  cover_image_url: '',
  coverFile: null,
  badge_name: '',
  achievement_id: '',
  reward_item_id: '',
  unlock_after: 0,
  time_limit_seconds: 60,
  config: {
    time_limit: 60,
    pairs: [{ id: 'p1', content_a: '', content_b: '', label: '' }],
  },
  content: {},
  content_input_type: 'text',
  reward_stars: 1,
  reward_coins: 10,
  sort_order: 0,
  is_active: true,
});

const createGameConfig = (gameType) => {
  if (gameType === 'memorama') {
    return {
      time_limit: 60,
      pairs: [{ id: 'p1', content_a: '', content_b: '', label: '' }],
    };
  }
  if (gameType === 'drag_drop') {
    return {
      zones: [{ id: 'z1', name: '', content: '' }],
      items: [{ id: 'i1', content: '', correct_zone: 'z1' }],
    };
  }
  if (gameType === 'quiz') {
    return {
      questions: [{
        id: 'q1',
        question: '',
        image_url: '',
        options: [
          { id: 'o1', content: '', is_correct: true },
          { id: 'o2', content: '', is_correct: false },
        ],
      }],
    };
  }
  if (gameType === 'matching') {
    return {
      pairs: [{ id: 'm1', left: '', right: '' }],
    };
  }
  return {};
};

const normalizeGameConfig = (gameType, savedConfig = {}) => {
  const saved = savedConfig && typeof savedConfig === 'object' ? savedConfig : {};
  if (gameType === 'memorama') {
    const pairs = saved.pairs || (saved.cards || []).map((card, index) => ({
      id: `p${index + 1}`,
      content_a: card.emoji || card.text || '',
      content_b: card.text || card.emoji || '',
      label: card.text || '',
    }));
    return {
      time_limit: saved.time_limit ?? saved.time_limit_seconds ?? 60,
      pairs: pairs.length ? pairs : createGameConfig(gameType).pairs,
    };
  }
  if (gameType === 'drag_drop') {
    const zones = saved.zones || (saved.destination_zones || []).map((zone, index) => ({
      id: zone.id || `z${index + 1}`,
      name: zone.name || zone.label || '',
      content: zone.content || '',
    }));
    const items = saved.items || (saved.draggable_items || []).map((item, index) => ({
      id: item.id || `i${index + 1}`,
      content: item.content || item.label || '',
      correct_zone: item.correct_zone || item.correct_zone_id || zones[0]?.id || '',
    }));
    return {
      zones: zones.length ? zones : createGameConfig(gameType).zones,
      items: items.length ? items : createGameConfig(gameType).items,
    };
  }
  if (gameType === 'quiz') {
    let questions = saved.questions;
    if (!questions && saved.question) {
      questions = [{
        id: 'q1',
        question: saved.question,
        image_url: saved.image_url || '',
        options: (saved.options || []).map((option, index) => ({
          id: `o${index + 1}`,
          content: String(option),
          is_correct: String(option) === String(saved.answer),
        })),
      }];
    }
    questions = (questions || []).map((question, questionIndex) => ({
      id: question.id || `q${questionIndex + 1}`,
      question: question.question || '',
      image_url: question.image_url || '',
      options: (question.options || []).map((option, optionIndex) => (
        typeof option === 'object'
          ? { id: option.id || `o${optionIndex + 1}`, content: option.content || '', is_correct: Boolean(option.is_correct) }
          : {
            id: `o${optionIndex + 1}`,
            content: String(option),
            is_correct: optionIndex === Number(question.correct_option || 0),
          }
      )),
    }));
    return {
      questions: questions.length ? questions : createGameConfig(gameType).questions,
    };
  }
  if (gameType === 'matching') {
    const pairs = saved.pairs || [];
    return {
      pairs: pairs.length ? pairs : createGameConfig(gameType).pairs,
    };
  }
  return saved;
};

const inferContentInputType = (gameType, config) => {
  let values = [];
  if (gameType === 'memorama') {
    values = (config.pairs || []).flatMap((pair) => [pair.content_a, pair.content_b]);
  } else if (gameType === 'drag_drop') {
    values = [...(config.zones || []), ...(config.items || [])].map((item) => item.content);
  } else if (gameType === 'quiz') {
    values = (config.questions || []).flatMap((question) => (
      (question.options || []).map((option) => option.content)
    ));
  } else if (gameType === 'matching') {
    values = (config.pairs || []).flatMap((pair) => [pair.left, pair.right]);
  }

  return values.some((value) => (
    /^https?:\/\//i.test(value || '') || value?.startsWith('/storage/')
  )) ? 'image' : 'text';
};

const createEntryId = (prefix) => (
  `${prefix}${globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`}`
);

function GameContentField({
  label,
  value,
  onChange,
  contentType,
  optional = false,
  csrfTokenRef,
  onCsrfToken,
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const isImage = contentType === 'image';

  const uploadImage = async (file) => {
    if (!file) return;
    setUploading(true);
    setUploadError('');
    try {
      const formData = new FormData();
      formData.append('image', file);
      const uploaded = await apiRequest('/admin/activities/media', {
        method: 'POST',
        csrfToken: csrfTokenRef.current,
        onCsrfToken,
        body: formData,
      });
      onChange(uploaded.media_url);
    } catch (error) {
      setUploadError(error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <label>
      {label}
      <input
        maxLength="2048"
        onChange={(event) => onChange(event.target.value)}
        placeholder={isImage ? 'Pega la URL de la imagen' : 'Texto, número o emoji'}
        required={!optional}
        type="text"
        value={value || ''}
      />
      {isImage && (
        <span className="admin-file-picker">
          <span>{uploading ? 'Subiendo imagen…' : 'O cargar desde el dispositivo'}</span>
          <input
            accept="image/jpeg,image/png,image/webp"
            disabled={uploading}
            onChange={(event) => {
              uploadImage(event.target.files?.[0]);
              event.target.value = '';
            }}
            type="file"
          />
        </span>
      )}
      {isImage && value && /^https?:\/\//i.test(value) && (
        <img alt={`Vista previa: ${label}`} className="admin-game-content-preview" src={value} />
      )}
      {isImage && value?.startsWith('/storage/') && (
        <img alt={`Vista previa: ${label}`} className="admin-game-content-preview" src={value} />
      )}
      {uploadError && <span className="admin-field-error" role="alert">{uploadError}</span>}
    </label>
  );
}

const gameTypes = [
  ['memorama', 'Memorama', 'grid_view'],
  ['drag_drop', 'Arrastrar y colocar', 'open_with'],
  ['quiz', 'Preguntas de opción múltiple', 'psychology'],
  ['matching', 'Unir parejas', 'join_inner'],
];

const gameTypeGuidance = {
  memorama: 'Agrega pares de contenidos relacionados; admite texto, números, emojis o imágenes.',
  drag_drop: 'Crea zonas destino y asigna cada elemento a la zona correcta.',
  quiz: 'Agrega preguntas, imágenes opcionales y al menos dos opciones con una respuesta correcta.',
  matching: 'Crea pares de conceptos que el jugador debe relacionar.',
};


async function apiRequest(path, {
  csrfToken,
  onCsrfToken,
  ...options
} = {}) {
  const sendRequest = (token) => fetch(`/api${path}`, {
    credentials: 'include',
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.body && !(options.body instanceof FormData)
        ? { 'Content-Type': 'application/json' }
        : {}),
      ...(token ? { 'X-CSRF-TOKEN': token } : {}),
      ...options.headers,
    },
  });

  let response = await sendRequest(csrfToken);

  if (response.status === 419 && options.method && options.method !== 'GET') {
    const refreshResponse = await fetch('/api/csrf-token', {
      credentials: 'include',
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });
    const refreshed = await refreshResponse.json().catch(() => ({}));

    if (!refreshResponse.ok || typeof refreshed.csrf_token !== 'string') {
      throw new Error(
        refreshed.message || 'La sesión CSRF expiró. Recarga la página e inténtalo de nuevo.',
      );
    }

    onCsrfToken?.(refreshed.csrf_token);
    response = await sendRequest(refreshed.csrf_token);
  }

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const validationMessage = body.errors
      ? Object.values(body.errors).flat().join(' ')
      : null;
    throw new Error(
      validationMessage
        || body.message
        || `No se pudo completar la solicitud (HTTP ${response.status}).`,
    );
  }

  return body;
}

function AdminPanel() {
  const csrfTokenRef = useRef('');
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [authMode, setAuthMode] = useState('login');
  const [selectedPlan, setSelectedPlan] = useState('free');
  const [billing, setBilling] = useState({
    plan: 'free',
    subscription_status: 'active',
    current_period_end: null,
    requested_plan: null,
    read_only: true,
  });
  const [subjects, setSubjects] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [section, setSection] = useState('subjects');
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [subjectForm, setSubjectForm] = useState(emptySubject);
  const [editingSubjectId, setEditingSubjectId] = useState(null);
  const [activityForm, setActivityForm] = useState(emptyActivity(null));
  const [editingActivityId, setEditingActivityId] = useState(null);

  const dashboardStats = useMemo(() => {
    const activeSubjects = subjects.filter((subject) => subject.is_active);
    const activities = activeSubjects.flatMap((subject) => subject.activities);
    const activeActivities = activities.filter((activity) => activity.is_active);

    return {
      activeSubjects: activeSubjects.length,
      activeActivities: activeActivities.length,
      stars: activeActivities.reduce((total, activity) => total + activity.reward_stars, 0),
      coins: activeActivities.reduce((total, activity) => total + activity.reward_coins, 0),
      badges: activeActivities.filter((activity) => activity.badge_name).length,
    };
  }, [subjects]);

  const updateCsrfToken = useCallback((token) => {
    csrfTokenRef.current = token;
  }, []);
  const startCheckout = async (plan, token = csrfTokenRef.current) => {
    const checkout = await apiRequest('/admin/billing/checkout', {
      method: 'POST',
      csrfToken: token,
      onCsrfToken: updateCsrfToken,
      body: JSON.stringify({ plan }),
    });
    window.location.assign(checkout.url);
  };
  const openBillingPortal = async () => {
    const portal = await apiRequest('/admin/billing/portal', {
      method: 'POST',
      csrfToken: csrfTokenRef.current,
      onCsrfToken: updateCsrfToken,
    });
    window.location.assign(portal.url);
  };

  const selectedSubject = useMemo(
    () => subjects.find((subject) => subject.id === selectedSubjectId),
    [subjects, selectedSubjectId],
  );

  const updateConfig = (updater) => {
    setActivityForm((current) => ({
      ...current,
      config: typeof updater === 'function' ? updater(current.config) : updater,
    }));
  };

  const loadSubjects = useCallback(async (token = csrfTokenRef.current) => {
    const requestOptions = { csrfToken: token, onCsrfToken: updateCsrfToken };
    const [data, achievementData, rewardData] = await Promise.all([
      apiRequest('/admin/subjects', requestOptions),
      apiRequest('/admin/achievements', requestOptions),
      apiRequest('/admin/rewards', requestOptions),
    ]);
    setSubjects(data);
    setAchievements(achievementData);
    setRewards(rewardData);
    setSelectedSubjectId((current) =>
      data.some((subject) => subject.id === current) ? current : data[0]?.id ?? null,
    );
  }, [updateCsrfToken]);

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        const csrf = await apiRequest('/csrf-token', { cache: 'no-store' });
        if (!mounted) return;
        updateCsrfToken(csrf.csrf_token);

        try {
          const session = await apiRequest('/admin/session', {
            csrfToken: csrfTokenRef.current,
            onCsrfToken: updateCsrfToken,
          });
          if (!mounted) return;
          setAuthenticated(true);
          setBilling(session.billing);
          setSelectedPlan(
            session.billing?.requested_plan
            || (session.billing?.plan === 'yearly' ? 'yearly' : 'monthly'),
          );
          await loadSubjects();
        } catch (sessionError) {
          if (sessionError.message !== 'Inicia sesión para continuar.' &&
              sessionError.message !== 'Tu sesión expiró. Inicia sesión nuevamente.') {
            throw sessionError;
          }
        }
      } catch (requestError) {
        if (mounted) setError(requestError.message);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initialize();
    return () => {
      mounted = false;
    };
  }, [loadSubjects, updateCsrfToken]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    const formData = new FormData(event.currentTarget);
    try {
      const response = await apiRequest('/admin/login', {
        method: 'POST',
        csrfToken: csrfTokenRef.current,
        onCsrfToken: updateCsrfToken,
        body: JSON.stringify({
          email: formData.get('email'),
          password: formData.get('password'),
        }),
      });
      setAuthenticated(true);
      updateCsrfToken(response.csrf_token);
      setBilling(response.billing);
      setSelectedPlan(
        response.billing?.requested_plan
        || (response.billing?.plan === 'yearly' ? 'yearly' : 'monthly'),
      );
      if (response.billing?.requested_plan) {
        await startCheckout(response.billing.requested_plan, response.csrf_token);
        return;
      }
      await loadSubjects(response.csrf_token);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    const formData = new FormData(event.currentTarget);
    try {
      const response = await apiRequest('/admin/register', {
        method: 'POST',
        csrfToken: csrfTokenRef.current,
        onCsrfToken: updateCsrfToken,
        body: JSON.stringify({
          email: formData.get('email'),
          password: formData.get('password'),
          password_confirmation: formData.get('password_confirmation'),
          plan: formData.get('plan'),
        }),
      });

      if (response.authenticated) {
        setAuthenticated(true);
        updateCsrfToken(response.csrf_token);
        if (response.checkout_plan) {
          await startCheckout(response.checkout_plan, response.csrf_token);
          return;
        }
        setBilling({
          plan: 'free',
          subscription_status: 'active',
          current_period_end: null,
          requested_plan: null,
          read_only: true,
        });
        await loadSubjects(response.csrf_token);
      } else {
        setSuccess(response.message);
        setAuthMode('login');
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    setError('');
    try {
      const response = await apiRequest('/admin/logout', {
        method: 'POST',
        csrfToken: csrfTokenRef.current,
        onCsrfToken: updateCsrfToken,
      });
      updateCsrfToken(response.csrf_token);
      setAuthenticated(false);
      setSubjects([]);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const saveSubject = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const path = editingSubjectId
        ? `/admin/subjects/${editingSubjectId}`
        : '/admin/subjects';
      await apiRequest(path, {
        method: editingSubjectId ? 'PUT' : 'POST',
        csrfToken: csrfTokenRef.current,
        onCsrfToken: updateCsrfToken,
        body: JSON.stringify(subjectForm),
      });
      await loadSubjects();
      setSubjectForm(emptySubject);
      setEditingSubjectId(null);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const saveActivity = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const supportedType = gameTypes.some(([type]) => type === activityForm.game_type);
      const config = supportedType
        ? normalizeGameConfig(activityForm.game_type, activityForm.config)
        : activityForm.config;
      let coverImageUrl = activityForm.cover_image_url;
      if (activityForm.coverFile) {
        const upload = new FormData();
        upload.append('image', activityForm.coverFile);
        const uploaded = await apiRequest('/admin/activities/cover', {
          method: 'POST',
          csrfToken: csrfTokenRef.current,
          onCsrfToken: updateCsrfToken,
          body: upload,
        });
        coverImageUrl = uploaded.cover_image_url;
      }
      const selectedAchievement = achievements.find(
        (achievement) => String(achievement.id) === String(activityForm.achievement_id),
      );
      const content = supportedType ? config : (activityForm.content || {});
      const activityData = { ...activityForm };
      delete activityData.coverFile;
      delete activityData.content_input_type;
      delete activityData.contentText;
      delete activityData.imageUrl;
      delete activityData.rewardVisualName;
      delete activityData.rewardVisualImage;
      activityData.cover_image_url = coverImageUrl || null;
      activityData.achievement_id = activityForm.achievement_id || null;
      activityData.badge_name = selectedAchievement?.name || activityForm.badge_name || null;
      activityData.reward_item_id = activityForm.reward_item_id || null;
      activityData.config = config;
      activityData.content = content;
      activityData.time_limit_seconds = activityForm.time_limit_seconds === ''
        ? null
        : Number(activityForm.time_limit_seconds);
      if (activityForm.game_type === 'memorama') {
        activityData.config = { ...config, time_limit: activityData.time_limit_seconds };
        activityData.content = activityData.config;
      }
      const path = editingActivityId
        ? `/admin/activities/${editingActivityId}`
        : `/admin/subjects/${selectedSubjectId}/activities`;
      await apiRequest(path, {
        method: editingActivityId ? 'PUT' : 'POST',
        csrfToken: csrfTokenRef.current,
        onCsrfToken: updateCsrfToken,
        body: JSON.stringify({ ...activityData, content }),
      });
      await loadSubjects();
      setActivityForm(emptyActivity(selectedSubjectId));
      setEditingActivityId(null);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const editSubject = (subject) => {
    setEditingSubjectId(subject.id);
    setSubjectForm({
      name: subject.name,
      description: subject.description || '',
      image_url: subject.image_url || '',
      icon: subject.icon || 'auto_stories',
      color: subject.color || '#4d96ff',
      sort_order: subject.sort_order,
      is_active: subject.is_active,
    });
    setSection('subjects');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const editActivity = (activity) => {
    const savedConfig = activity.config && Object.keys(activity.config).length
      ? activity.config
      : activity.content || {};
    const config = normalizeGameConfig(activity.game_type, savedConfig);
    setEditingActivityId(activity.id);
    setActivityForm({
      ...emptyActivity(selectedSubjectId),
      ...activity,
      cover_image_url: activity.cover_image_url || activity.content?.image_url || '',
      coverFile: null,
      achievement_id: activity.achievement_id
        ? String(activity.achievement_id)
        : String(achievements.find((achievement) => achievement.name === activity.badge_name)?.id || ''),
      reward_item_id: activity.reward_item_id
        ? String(activity.reward_item_id)
        : String(rewards.find((reward) => reward.name === activity.content?.reward_visual?.name)?.id || ''),
      badge_name: activity.badge_name || '',
      config,
      content: activity.content || {},
      content_input_type: inferContentInputType(activity.game_type, config),
      time_limit_seconds: activity.time_limit_seconds ?? config.time_limit ?? '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleSubject = async (subject) => {
    setError('');
    try {
      if (subject.is_active) {
        await apiRequest(`/admin/subjects/${subject.id}`, {
          method: 'DELETE',
          csrfToken: csrfTokenRef.current,
          onCsrfToken: updateCsrfToken,
        });
      } else {
        await apiRequest(`/admin/subjects/${subject.id}`, {
          method: 'PUT',
          csrfToken: csrfTokenRef.current,
          onCsrfToken: updateCsrfToken,
          body: JSON.stringify({ ...subject, is_active: true }),
        });
      }
      await loadSubjects();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const toggleActivity = async (activity) => {
    setError('');
    try {
      if (activity.is_active) {
        await apiRequest(`/admin/activities/${activity.id}`, {
          method: 'DELETE',
          csrfToken: csrfTokenRef.current,
          onCsrfToken: updateCsrfToken,
        });
      } else {
        await apiRequest(`/admin/activities/${activity.id}`, {
          method: 'PUT',
          csrfToken: csrfTokenRef.current,
          onCsrfToken: updateCsrfToken,
          body: JSON.stringify({ ...activity, is_active: true }),
        });
      }
      await loadSubjects();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  if (loading) {
    return (
      <main className="admin-page">
        <div className="admin-loading">Preparando la zona de papás…</div>
      </main>
    );
  }

  if (!authenticated) {
    return (
      <main className="admin-page admin-login-page">
        <Link className="admin-back-link" to="/">← Volver a Mateo</Link>
        <section className="admin-login-card">
          <div className="admin-brand-mark" aria-hidden="true">🦉</div>
          <span className="admin-eyebrow">ACCESO PARA ADULTOS</span>
          <h1>{authMode === 'login' ? 'Zona de Papás' : 'Crear cuenta'}</h1>
          <p>
            {authMode === 'login'
              ? 'Inicia sesión para cuidar las aventuras de aprendizaje.'
              : 'Regístrate para crear tu cuenta de administrador.'}
          </p>
          {error && <div className="admin-alert" role="alert">{error}</div>}
          {success && <div className="admin-success" role="status">{success}</div>}
          <form
            className="admin-form"
            onSubmit={authMode === 'login' ? handleLogin : handleRegister}
          >
            <label>
              Correo electrónico
              <input
                autoComplete={authMode === 'login' ? 'username' : 'email'}
                name="email"
                placeholder="padre@correo.com"
                required
                type="email"
              />
            </label>
            <label>
              Contraseña
              <input
                autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
                minLength={authMode === 'register' ? 8 : undefined}
                name="password"
                placeholder="Tu contraseña"
                required
                type="password"
              />
            </label>
            {authMode === 'register' && (
              <label>
                Elige tu plan
                <select
                  name="plan"
                  onChange={(event) => setSelectedPlan(event.target.value)}
                  value={selectedPlan}
                >
                  <option value="free">Gratis · solo lectura</option>
                  <option value="monthly">Mensual · administrar contenido</option>
                  <option value="yearly">Anual · administrar contenido</option>
                </select>
              </label>
            )}
            {authMode === 'register' && selectedPlan !== 'free' && (
              <p className="admin-plan-checkout-note">
                Continuarás a Stripe Checkout para confirmar el precio y completar el pago seguro.
              </p>
            )}
            {authMode === 'register' && (
              <label>
                Confirmar contraseña
                <input
                  autoComplete="new-password"
                  minLength={8}
                  name="password_confirmation"
                  placeholder="Repite tu contraseña"
                  required
                  type="password"
                />
              </label>
            )}
            <button className="admin-primary-button" disabled={submitting} type="submit">
              {submitting
                ? (authMode === 'login' ? 'Verificando…' : 'Creando cuenta…')
                : (authMode === 'login' ? 'Entrar a administrar' : 'Crear cuenta de administrador')}
              <span className="material-symbols-outlined">
                {authMode === 'login' ? 'arrow_forward' : 'person_add'}
              </span>
            </button>
          </form>
          <button
            className="admin-auth-switch"
            onClick={() => {
              setError('');
              setSuccess('');
              setAuthMode(authMode === 'login' ? 'register' : 'login');
            }}
            type="button"
          >
            {authMode === 'login'
              ? '¿No tienes cuenta? Regístrate'
              : '¿Ya tienes cuenta? Inicia sesión'}
          </button>
          <div className="admin-demo-note">
            <span className="material-symbols-outlined">shield_lock</span>
            Elige entre plan gratis, mensual o anual. Mateo sigue siendo una demostración.
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="admin-page">
      <header className="admin-header">
        <Link className="admin-brand" to="/">
          <span className="admin-brand-mark" aria-hidden="true">🦉</span>
          <span><strong>ChikiAprende</strong><small>Zona de Papás</small></span>
        </Link>
        <div className="admin-header-actions">
          <span className="admin-secure-label">
            <span className="material-symbols-outlined">lock</span>
            Panel seguro
          </span>
          <button className="admin-logout-button" onClick={handleLogout} type="button">
            Cerrar sesión
          </button>
        </div>
      </header>

      <div className="admin-content">
        <section className="admin-welcome">
          <div>
            <span className="admin-eyebrow">TU ESPACIO DE ADMINISTRACIÓN</span>
            <h1>¡Hola, mamá o papá! <span aria-hidden="true">👋</span></h1>
            <p>Organiza las materias y las actividades que acompañan cada aventura.</p>
          </div>
          <div className="admin-welcome-icon" aria-hidden="true">✨</div>
        </section>

        <section className="admin-billing-card" aria-labelledby="admin-billing-title">
          <div className="admin-billing-copy">
            <span className="admin-eyebrow">PLAN DE LA CUENTA</span>
            <h2 id="admin-billing-title">
              {billing.plan === 'monthly' ? 'Plan mensual' : billing.plan === 'yearly' ? 'Plan anual' : 'Plan gratuito'}
            </h2>
            <p>
              {billing.read_only
                ? 'El plan gratuito permite consultar el contenido. Para crearlo y editarlo, elige un plan de pago.'
                : `Suscripción ${billing.subscription_status}${billing.current_period_end
                  ? ` · Vigente hasta ${new Date(billing.current_period_end).toLocaleDateString()}`
                  : ''}.`}
            </p>
          </div>
          <form
            className="admin-billing-actions"
            onSubmit={(event) => {
              event.preventDefault();
              setError('');
              setSubmitting(true);
              const action = billing.can_manage_subscription
                ? openBillingPortal()
                : startCheckout(selectedPlan === 'free' ? 'monthly' : selectedPlan);
              action
                .catch((requestError) => setError(requestError.message))
                .finally(() => setSubmitting(false));
            }}
          >
            {billing.can_manage_subscription
              ? <p>Para cambiar o cancelar tu suscripción, usa el portal seguro de Stripe.</p>
              : (
                <label>
                  Cambiar a
                  <select
                    aria-label="Plan de pago"
                    onChange={(event) => setSelectedPlan(event.target.value)}
                    value={selectedPlan === 'free' ? 'monthly' : selectedPlan}
                  >
                    <option value="monthly">Mensual</option>
                    <option value="yearly">Anual</option>
                  </select>
                </label>
              )}
            <button className="admin-primary-button" disabled={submitting} type="submit">
              {submitting
                ? 'Abriendo Stripe…'
                : billing.can_manage_subscription
                  ? 'Administrar suscripción'
                  : 'Actualizar plan'}
              <span className="material-symbols-outlined">credit_card</span>
            </button>
          </form>
        </section>

        <section className="admin-dashboard-stats" aria-label="Resumen de contenido activo">
          <article className="admin-stat-card">
            <span className="admin-stat-icon admin-stat-blue material-symbols-outlined">school</span>
            <div><strong>{dashboardStats.activeSubjects}</strong><span>Materias activas</span></div>
          </article>
          <article className="admin-stat-card">
            <span className="admin-stat-icon admin-stat-green material-symbols-outlined">extension</span>
            <div><strong>{dashboardStats.activeActivities}</strong><span>Actividades listas</span></div>
          </article>
          <article className="admin-stat-card">
            <span className="admin-stat-icon admin-stat-yellow">⭐</span>
            <div><strong>{dashboardStats.stars}</strong><span>Estrellas disponibles</span></div>
          </article>
          <article className="admin-stat-card">
            <span className="admin-stat-icon admin-stat-yellow">🪙</span>
            <div><strong>{dashboardStats.coins}</strong><span>Monedas disponibles</span></div>
          </article>
          <article className="admin-stat-card">
            <span className="admin-stat-icon admin-stat-purple material-symbols-outlined">military_tech</span>
            <div><strong>{dashboardStats.badges}</strong><span>Insignias configuradas</span></div>
          </article>
        </section>
        <p className="admin-stats-caption">
          Recompensas posibles de las actividades activas; el progreso personal de Mateo sigue en modo demostración.
        </p>

        <nav className="admin-tabs" aria-label="Secciones del panel">
          <button
            className={section === 'subjects' ? 'active' : ''}
            onClick={() => setSection('subjects')}
            type="button"
          >
            <span className="material-symbols-outlined">school</span>
            Materias
          </button>
          <button
            className={section === 'activities' ? 'active' : ''}
            disabled={!selectedSubject}
            onClick={() => {
              setSection('activities');
              setActivityForm(emptyActivity(selectedSubjectId));
              setEditingActivityId(null);
            }}
            type="button"
          >
            <span className="material-symbols-outlined">extension</span>
            Actividades
          </button>
        </nav>

        {error && <div className="admin-alert" role="alert">{error}</div>}

        {section === 'subjects' ? (
          <div className="admin-layout">
            <section className="admin-panel-card">
              <div className="admin-section-heading">
                <div>
                  <span className="admin-eyebrow">CONTENIDO EDUCATIVO</span>
                  <h2>Materias</h2>
                </div>
                <span className="admin-count">{subjects.length}</span>
              </div>
              {subjects.length === 0 ? (
                <div className="admin-empty-state">
                  <span className="material-symbols-outlined">auto_stories</span>
                  Aún no hay materias. ¡Crea la primera!
                </div>
              ) : (
                <div className="admin-subject-list">
                  {subjects.map((subject) => (
                    <article className="admin-subject-row" key={subject.id}>
                      <span
                        className="admin-subject-icon"
                        style={{ backgroundColor: subject.color || '#4d96ff' }}
                      >
                        {subject.image_url ? (
                          <img alt="" src={subject.image_url} />
                        ) : (
                          <span className="material-symbols-outlined">{subject.icon || 'school'}</span>
                        )}
                      </span>
                      <div className="admin-row-copy">
                        <strong>{subject.name}</strong>
                        <span>{subject.activities.length} actividades · Orden {subject.sort_order}</span>
                        <span className={`admin-status ${subject.is_active ? 'is-active' : ''}`}>
                          {subject.is_active ? 'Activa' : 'Desactivada'}
                        </span>
                      </div>
                      <div className="admin-row-actions">
                        <button
                          aria-label={`Gestionar actividades de ${subject.name}`}
                          className="admin-icon-button"
                          onClick={() => {
                            setSelectedSubjectId(subject.id);
                            setSection('activities');
                            setActivityForm(emptyActivity(subject.id));
                            setEditingActivityId(null);
                          }}
                          title="Gestionar actividades"
                          type="button"
                        >
                          <span className="material-symbols-outlined">extension</span>
                        </button>
                        {!billing.read_only && <button
                          aria-label={`Editar ${subject.name}`}
                          className="admin-icon-button"
                          onClick={() => editSubject(subject)}
                          title="Editar materia"
                          type="button"
                        >
                          <span className="material-symbols-outlined">edit</span>
                        </button>}
                        {!billing.read_only && <button
                          className="admin-text-button"
                          onClick={() => toggleSubject(subject)}
                          type="button"
                        >
                          {subject.is_active ? 'Desactivar' : 'Activar'}
                        </button>}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            {!billing.read_only && <section className="admin-panel-card admin-editor-card">
              <div className="admin-section-heading">
                <div>
                  <span className="admin-eyebrow">{editingSubjectId ? 'ACTUALIZAR' : 'NUEVO CONTENIDO'}</span>
                  <h2>{editingSubjectId ? 'Editar materia' : 'Crear materia'}</h2>
                </div>
                <span className="admin-heading-icon">📚</span>
              </div>
              <form className="admin-form" onSubmit={saveSubject}>
                <label>
                  Nombre
                  <input
                    maxLength="120"
                    onChange={(event) => setSubjectForm({ ...subjectForm, name: event.target.value })}
                    placeholder="Ej. Matemáticas"
                    required
                    value={subjectForm.name}
                  />
                </label>
                <label>
                  Descripción
                  <textarea
                    maxLength="1000"
                    onChange={(event) => setSubjectForm({ ...subjectForm, description: event.target.value })}
                    placeholder="¿Qué descubrirá el niño?"
                    rows="3"
                    value={subjectForm.description}
                  />
                </label>
                <label>
                  Imagen de portada (URL, opcional)
                  <input
                    maxLength="2048"
                    onChange={(event) => setSubjectForm({ ...subjectForm, image_url: event.target.value })}
                    placeholder="https://.../matematicas.png"
                    type="url"
                    value={subjectForm.image_url}
                  />
                </label>
                <div className="admin-image-preview">
                  <img
                    alt="Vista previa de portada"
                    src={subjectForm.image_url || defaultSubjectImage}
                  />
                  <span>
                    {subjectForm.image_url
                      ? 'Vista previa de la materia'
                      : 'Búho predeterminado'}
                  </span>
                </div>
                <div className="admin-form-grid">
                  <fieldset className="admin-choice-field">
                    <legend>Icono de la materia</legend>
                    <div className="admin-icon-picker">
                      {subjectIcons.map(([icon, label]) => (
                        <button
                          aria-label={label}
                          aria-pressed={subjectForm.icon === icon}
                          className={`admin-icon-choice ${subjectForm.icon === icon ? 'selected' : ''}`}
                          key={icon}
                          onClick={() => setSubjectForm({ ...subjectForm, icon })}
                          title={label}
                          type="button"
                        >
                          <span className="material-symbols-outlined">{icon}</span>
                        </button>
                      ))}
                    </div>
                    <span className="admin-field-hint">
                      Seleccionado: {subjectIcons.find(([icon]) => icon === subjectForm.icon)?.[1] || 'Personalizado'}
                    </span>
                  </fieldset>
                  <fieldset className="admin-choice-field">
                    <legend>Color identificativo</legend>
                    <div className="admin-color-picker">
                      {subjectColors.map(([color, label]) => (
                        <button
                          aria-label={label}
                          aria-pressed={subjectForm.color === color}
                          className={`admin-color-choice ${subjectForm.color === color ? 'selected' : ''}`}
                          key={color}
                          onClick={() => setSubjectForm({ ...subjectForm, color })}
                          style={{ '--choice-color': color }}
                          title={label}
                          type="button"
                        />
                      ))}
                    </div>
                    <span className="admin-field-hint">
                      {subjectColors.find(([color]) => color === subjectForm.color)?.[1] || 'Color personalizado'}
                      <span
                        aria-hidden="true"
                        className="admin-selected-color"
                        style={{ backgroundColor: subjectForm.color }}
                      />
                    </span>
                  </fieldset>
                </div>
                <label>
                  Orden de aparición
                  <input
                    min="0"
                    onChange={(event) => setSubjectForm({ ...subjectForm, sort_order: Number(event.target.value) })}
                    type="number"
                    value={subjectForm.sort_order}
                  />
                </label>
                <label className="admin-checkbox-label">
                  <input
                    checked={subjectForm.is_active}
                    onChange={(event) => setSubjectForm({ ...subjectForm, is_active: event.target.checked })}
                    type="checkbox"
                  />
                  Materia disponible para Mateo
                </label>
                <button className="admin-primary-button" disabled={submitting} type="submit">
                  {editingSubjectId ? 'Guardar cambios' : 'Crear materia'}
                  <span className="material-symbols-outlined">check</span>
                </button>
                {editingSubjectId && (
                  <button
                    className="admin-cancel-button"
                    onClick={() => {
                      setEditingSubjectId(null);
                      setSubjectForm(emptySubject);
                    }}
                    type="button"
                  >
                    Cancelar edición
                  </button>
                )}
              </form>
            </section>}
          </div>
        ) : (
          <section className="admin-panel-card admin-activities-card">
            <div className="admin-section-heading">
              <div>
                <span className="admin-eyebrow">MATERIA SELECCIONADA</span>
                <h2>{selectedSubject?.name || 'Actividades'}</h2>
              </div>
              <button
                className="admin-cancel-button"
                onClick={() => setSection('subjects')}
                type="button"
              >
                ← Volver a materias
              </button>
            </div>
            <div className="admin-activity-layout">
              <div className="admin-activity-list">
                {(selectedSubject?.activities || []).map((activity) => (
                  <article className="admin-activity-row" key={activity.id}>
                    {activity.cover_image_url || activity.content?.image_url ? (
                      <img
                        alt=""
                        className="admin-activity-cover"
                        src={activity.cover_image_url || activity.content.image_url}
                      />
                    ) : (
                      <span className="admin-game-icon">
                        <span className="material-symbols-outlined">
                          {gameTypes.find(([type]) => type === activity.game_type)?.[2] || 'extension'}
                        </span>
                      </span>
                    )}
                    <div className="admin-row-copy">
                      <strong>{activity.name}</strong>
                      <span>{gameTypes.find(([type]) => type === activity.game_type)?.[1] || activity.game_type} · Nivel {activity.difficulty}/5 · Orden {activity.sort_order}</span>
                      <span className="admin-reward-summary">
                        ⭐ {activity.reward_stars} · 🪙 {activity.reward_coins}
                        {activity.badge_name ? ` · 🏅 ${activity.badge_name}` : ''}
                      </span>
                      <span className={`admin-status ${activity.is_active ? 'is-active' : ''}`}>
                        {activity.is_active ? 'Activa' : 'Desactivada'}
                      </span>
                    </div>
                    <div className="admin-row-actions">
                      {!billing.read_only && <button
                        aria-label={`Editar ${activity.name}`}
                        className="admin-icon-button"
                        onClick={() => editActivity(activity)}
                        type="button"
                      >
                        <span className="material-symbols-outlined">edit</span>
                      </button>}
                      {!billing.read_only && <button
                        className="admin-text-button"
                        onClick={() => toggleActivity(activity)}
                        type="button"
                      >
                        {activity.is_active ? 'Desactivar' : 'Activar'}
                      </button>}
                    </div>
                  </article>
                ))}
                {selectedSubject?.activities.length === 0 && (
                  <div className="admin-empty-state">
                    <span className="material-symbols-outlined">extension</span>
                    Esta materia todavía no tiene actividades.
                  </div>
                )}
              </div>

              {!billing.read_only && <form className="admin-form admin-activity-form" onSubmit={saveActivity}>
                <div className="admin-activity-form-heading">
                  <span className="admin-eyebrow">{editingActivityId ? 'ACTUALIZAR' : 'NUEVO MINIJUEGO'}</span>
                  <h3>{editingActivityId ? 'Editar actividad' : 'Crear actividad'}</h3>
                </div>
                <section className="admin-editor-section">
                  <div className="admin-editor-section-title">
                    <span className="admin-editor-step">1</span>
                    <div><h4>Información básica</h4><p>Identifica el reto y define cómo aparecerá.</p></div>
                  </div>
                  <label>
                    Nombre de la actividad *
                    <input
                      maxLength="120"
                      onChange={(event) => setActivityForm({ ...activityForm, name: event.target.value })}
                      placeholder="Ej. Sumas con animalitos"
                      required
                      value={activityForm.name}
                    />
                  </label>
                  <label>
                    Descripción educativa
                    <textarea
                      maxLength="1000"
                      onChange={(event) => setActivityForm({ ...activityForm, description: event.target.value })}
                      rows="2"
                      value={activityForm.description || ''}
                    />
                  </label>
                  <div className="admin-form-grid">
                    <label>
                      Tipo de minijuego *
                      <select
                        onChange={(event) => {
                          const game_type = event.target.value;
                          setActivityForm((current) => ({
                            ...current,
                            game_type,
                            config: createGameConfig(game_type),
                            content: {},
                          }));
                        }}
                        value={activityForm.game_type}
                      >
                        {!gameTypes.some(([type]) => type === activityForm.game_type) && (
                          <option value={activityForm.game_type}>{activityForm.game_type} · formato anterior</option>
                        )}
                        {gameTypes.map(([type, label]) => <option key={type} value={type}>{label}</option>)}
                      </select>
                      <span className="admin-field-hint">
                        {gameTypeGuidance[activityForm.game_type]
                          || 'Este tipo de juego existente se conserva. Elige uno de los cuatro formatos nuevos para editar su contenido visualmente.'}
                      </span>
                    </label>
                    <label>
                      Dificultad *
                      <select
                        onChange={(event) => setActivityForm({ ...activityForm, difficulty: Number(event.target.value) })}
                        value={activityForm.difficulty}
                      >
                        {[1, 2, 3, 4, 5].map((level) => <option key={level} value={level}>{level} · {['Muy fácil', 'Fácil', 'Media', 'Difícil', 'Reto'][level - 1]}</option>)}
                      </select>
                    </label>
                    <label>
                      Orden
                      <input
                        min="0"
                        onChange={(event) => setActivityForm({ ...activityForm, sort_order: Number(event.target.value) })}
                        type="number"
                        value={activityForm.sort_order}
                      />
                    </label>
                    <label>
                      Tiempo límite (segundos, opcional)
                      <input
                        max="3600"
                        min="1"
                        onChange={(event) => setActivityForm({
                          ...activityForm,
                          time_limit_seconds: event.target.value,
                          ...(activityForm.game_type === 'memorama'
                            ? { config: { ...activityForm.config, time_limit: Number(event.target.value) || null } }
                            : {}),
                        })}
                        placeholder="Sin límite"
                        type="number"
                        value={activityForm.time_limit_seconds ?? ''}
                      />
                    </label>
                    <label className="admin-checkbox-label">
                      <input
                        checked={activityForm.is_active}
                        onChange={(event) => setActivityForm({ ...activityForm, is_active: event.target.checked })}
                        type="checkbox"
                      />
                      Actividad activa y visible para Mateo
                    </label>
                  </div>
                </section>

                <section className="admin-editor-section">
                  <div className="admin-editor-section-title">
                    <span className="admin-editor-step">2</span>
                    <div><h4>Contenido pedagógico</h4><p>Explica al jugador qué debe hacer.</p></div>
                  </div>
                  <label>
                    Instrucciones para el jugador *
                    <textarea
                      maxLength="5000"
                      onChange={(event) => setActivityForm({ ...activityForm, instructions: event.target.value })}
                      required
                      rows="3"
                      value={activityForm.instructions || ''}
                    />
                  </label>
                  <label>
                    Imagen de portada (opcional)
                    <input
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(event) => setActivityForm({
                        ...activityForm,
                        coverFile: event.target.files?.[0] || null,
                      })}
                      type="file"
                    />
                    <span className="admin-field-hint">JPG, PNG o WebP; máximo 5 MB. Se muestra en la tarjeta del listado.</span>
                  </label>
                  {(activityForm.cover_image_url || activityForm.coverFile) && (
                    <div className="admin-image-preview">
                      {activityForm.cover_image_url && !activityForm.coverFile && (
                        <img alt="Portada actual de la actividad" src={activityForm.cover_image_url} />
                      )}
                      <span>{activityForm.coverFile?.name || 'Portada actual'}</span>
                    </div>
                  )}
                </section>

                <section className="admin-editor-section">
                  <div className="admin-editor-section-title">
                    <span className="admin-editor-step">3</span>
                    <div><h4>Configuración del minijuego</h4><p>{gameTypeGuidance[activityForm.game_type] || 'La configuración previa se conservará al guardar. Cambia a uno de los cuatro tipos disponibles para editarla visualmente.'}</p></div>
                  </div>
                  {gameTypes.some(([type]) => type === activityForm.game_type) && (
                    <label>
                      Tipo de contenido para los elementos
                      <select
                        onChange={(event) => setActivityForm((current) => ({
                          ...current,
                          content_input_type: event.target.value,
                        }))}
                        value={activityForm.content_input_type || 'text'}
                      >
                        <option value="text">Solo texto, números o emojis</option>
                        <option value="image">Solo imágenes (URL o cargar archivo)</option>
                      </select>
                      <span className="admin-field-hint">La elección se aplica a todos los elementos de este minijuego.</span>
                    </label>
                  )}
                  {activityForm.game_type === 'memorama' && (
                    <>
                      <div className="admin-repeatable-heading">
                        <strong>Parejas</strong>
                        <button
                          className="admin-add-row-button"
                          disabled={(activityForm.config.pairs || []).length >= 30}
                          onClick={() => updateConfig((config) => ({
                            ...config,
                            pairs: [...config.pairs, {
                              id: createEntryId('p'),
                              content_a: '',
                              content_b: '',
                              label: '',
                            }],
                          }))}
                          type="button"
                        >＋ Agregar pareja</button>
                      </div>
                      {(activityForm.config.pairs || []).map((pair, index) => (
                        <div className="admin-repeatable-row admin-pair-row" key={pair.id}>
                          <GameContentField
                            label="Contenido A"
                            contentType={activityForm.content_input_type}
                            csrfTokenRef={csrfTokenRef}
                            onCsrfToken={updateCsrfToken}
                            onChange={(value) => updateConfig((config) => ({
                              ...config,
                              pairs: config.pairs.map((entry, itemIndex) => itemIndex === index
                                ? { ...entry, content_a: value } : entry),
                            }))}
                            value={pair.content_a}
                          />
                          <GameContentField
                            label="Contenido B"
                            contentType={activityForm.content_input_type}
                            csrfTokenRef={csrfTokenRef}
                            onCsrfToken={updateCsrfToken}
                            onChange={(value) => updateConfig((config) => ({
                              ...config,
                              pairs: config.pairs.map((entry, itemIndex) => itemIndex === index
                                ? { ...entry, content_b: value } : entry),
                            }))}
                            value={pair.content_b}
                          />
                          <label className="admin-pair-label">Etiqueta (opcional)
                            <input maxLength="120" onChange={(event) => updateConfig((config) => ({
                              ...config,
                              pairs: config.pairs.map((entry, itemIndex) => itemIndex === index
                                ? { ...entry, label: event.target.value } : entry),
                            }))} value={pair.label || ''} />
                          </label>
                          <button aria-label={`Quitar pareja ${index + 1}`} className="admin-remove-row-button" disabled={activityForm.config.pairs.length <= 1} onClick={() => updateConfig((config) => ({
                            ...config,
                            pairs: config.pairs.filter((_, itemIndex) => itemIndex !== index),
                          }))} type="button">×</button>
                        </div>
                      ))}
                    </>
                  )}
                  {activityForm.game_type === 'drag_drop' && (
                    <>
                      <div className="admin-repeatable-heading">
                        <strong>Zonas destino</strong>
                        <button className="admin-add-row-button" disabled={activityForm.config.zones.length >= 50} onClick={() => updateConfig((config) => ({
                          ...config,
                          zones: [...config.zones, { id: createEntryId('z'), name: '', content: '' }],
                        }))} type="button">＋ Agregar zona</button>
                      </div>
                      {(activityForm.config.zones || []).map((zone, index) => (
                        <div className="admin-repeatable-row" key={zone.id}>
                          <label>Nombre de zona<input maxLength="120" onChange={(event) => updateConfig((config) => ({
                            ...config,
                            zones: config.zones.map((entry, itemIndex) => itemIndex === index
                              ? { ...entry, name: event.target.value } : entry),
                          }))} required value={zone.name} /></label>
                          <GameContentField
                            label="Contenido de la zona"
                            contentType={activityForm.content_input_type}
                            csrfTokenRef={csrfTokenRef}
                            onCsrfToken={updateCsrfToken}
                            onChange={(value) => updateConfig((config) => ({
                              ...config,
                              zones: config.zones.map((entry, itemIndex) => itemIndex === index
                                ? { ...entry, content: value } : entry),
                            }))}
                            value={zone.content}
                          />
                          <button aria-label={`Quitar zona ${index + 1}`} className="admin-remove-row-button" disabled={activityForm.config.zones.length <= 1} onClick={() => updateConfig((config) => {
                            const zones = config.zones.filter((_, itemIndex) => itemIndex !== index);
                            const zoneIds = new Set(zones.map((entry) => entry.id));
                            return {
                              ...config,
                              zones,
                              items: config.items.map((entry) => ({
                                ...entry,
                                correct_zone: zoneIds.has(entry.correct_zone) ? entry.correct_zone : zones[0]?.id || '',
                              })),
                            };
                          })} type="button">×</button>
                        </div>
                      ))}
                      <div className="admin-repeatable-heading">
                        <strong>Elementos arrastrables</strong>
                        <button className="admin-add-row-button" disabled={activityForm.config.items.length >= 50} onClick={() => updateConfig((config) => ({
                          ...config,
                          items: [...config.items, {
                            id: createEntryId('i'),
                            content: '',
                            correct_zone: config.zones[0]?.id || '',
                          }],
                        }))} type="button">＋ Agregar elemento</button>
                      </div>
                      {(activityForm.config.items || []).map((item, index) => (
                        <div className="admin-repeatable-row" key={item.id}>
                          <GameContentField
                            label="Elemento"
                            contentType={activityForm.content_input_type}
                            csrfTokenRef={csrfTokenRef}
                            onCsrfToken={updateCsrfToken}
                            onChange={(value) => updateConfig((config) => ({
                              ...config,
                              items: config.items.map((entry, itemIndex) => itemIndex === index
                                ? { ...entry, content: value } : entry),
                            }))}
                            value={item.content}
                          />
                          <label>Zona correcta<select onChange={(event) => updateConfig((config) => ({
                            ...config,
                            items: config.items.map((entry, itemIndex) => itemIndex === index
                              ? { ...entry, correct_zone: event.target.value } : entry),
                          }))} required value={item.correct_zone || ''}>
                            {activityForm.config.zones.map((zone) => <option key={zone.id} value={zone.id}>{zone.name || 'Zona sin nombre'}</option>)}
                          </select></label>
                          <button aria-label={`Quitar elemento ${index + 1}`} className="admin-remove-row-button" disabled={activityForm.config.items.length <= 1} onClick={() => updateConfig((config) => ({
                            ...config,
                            items: config.items.filter((_, itemIndex) => itemIndex !== index),
                          }))} type="button">×</button>
                        </div>
                      ))}
                    </>
                  )}
                  {activityForm.game_type === 'quiz' && (
                    <>
                      <div className="admin-repeatable-heading">
                        <strong>Preguntas</strong>
                        <button className="admin-add-row-button" disabled={activityForm.config.questions.length >= 100} onClick={() => updateConfig((config) => ({
                          ...config,
                          questions: [...config.questions, {
                            id: createEntryId('q'),
                            question: '',
                            image_url: '',
                            options: [
                              { id: createEntryId('o'), content: '', is_correct: true },
                              { id: createEntryId('o'), content: '', is_correct: false },
                            ],
                          }],
                        }))} type="button">＋ Agregar pregunta</button>
                      </div>
                      {(activityForm.config.questions || []).map((question, index) => (
                        <div className="admin-question-card" key={question.id}>
                          <label>Pregunta<input maxLength="500" onChange={(event) => updateConfig((config) => ({
                            ...config,
                            questions: config.questions.map((entry, itemIndex) => itemIndex === index
                              ? { ...entry, question: event.target.value } : entry),
                          }))} required value={question.question} /></label>
                          <GameContentField
                            label="Imagen de la pregunta (opcional)"
                            contentType="image"
                            csrfTokenRef={csrfTokenRef}
                            onCsrfToken={updateCsrfToken}
                            onChange={(value) => updateConfig((config) => ({
                              ...config,
                              questions: config.questions.map((entry, itemIndex) => itemIndex === index
                                ? { ...entry, image_url: value } : entry),
                            }))}
                            optional
                            value={question.image_url}
                          />
                          <div className="admin-repeatable-heading">
                            <strong>Opciones de respuesta</strong>
                            <button className="admin-add-row-button" disabled={question.options.length >= 8} onClick={() => updateConfig((config) => ({
                              ...config,
                              questions: config.questions.map((entry, itemIndex) => itemIndex === index
                                ? { ...entry, options: [...entry.options, { id: createEntryId('o'), content: '', is_correct: false }] }
                                : entry),
                            }))} type="button">＋ Agregar opción</button>
                          </div>
                          <div className="admin-quiz-options">
                            {question.options.map((option, optionIndex) => (
                              <div className="admin-quiz-option" key={option.id}>
                                <GameContentField
                                  label={`Opción ${optionIndex + 1}`}
                                  contentType={activityForm.content_input_type}
                                  csrfTokenRef={csrfTokenRef}
                                  onCsrfToken={updateCsrfToken}
                                  onChange={(value) => updateConfig((config) => ({
                                    ...config,
                                    questions: config.questions.map((entry, itemIndex) => itemIndex === index
                                      ? {
                                        ...entry,
                                        options: entry.options.map((choice, choiceIndex) => choiceIndex === optionIndex
                                          ? { ...choice, content: value } : choice),
                                      }
                                      : entry),
                                  }))}
                                  value={option.content}
                                />
                                <label className="admin-correct-option">
                                  <input
                                    checked={option.is_correct}
                                    name={`correct-${question.id}`}
                                    onChange={() => updateConfig((config) => ({
                                      ...config,
                                      questions: config.questions.map((entry, itemIndex) => itemIndex === index
                                        ? {
                                          ...entry,
                                          options: entry.options.map((choice, choiceIndex) => ({
                                            ...choice,
                                            is_correct: choiceIndex === optionIndex,
                                          })),
                                        }
                                        : entry),
                                    }))}
                                    required
                                    type="radio"
                                  />
                                  Correcta
                                </label>
                                <button
                                  aria-label={`Quitar opción ${optionIndex + 1}`}
                                  className="admin-remove-row-button"
                                  disabled={question.options.length <= 2}
                                  onClick={() => updateConfig((config) => ({
                                    ...config,
                                    questions: config.questions.map((entry, itemIndex) => {
                                      if (itemIndex !== index) return entry;
                                      const options = entry.options.filter((_, choiceIndex) => choiceIndex !== optionIndex);
                                      if (!options.some((choice) => choice.is_correct)) options[0].is_correct = true;
                                      return { ...entry, options };
                                    }),
                                  }))}
                                  type="button"
                                >×</button>
                              </div>
                            ))}
                          </div>
                          <button aria-label={`Quitar pregunta ${index + 1}`} className="admin-remove-row-button" disabled={activityForm.config.questions.length <= 1} onClick={() => updateConfig((config) => ({
                            ...config,
                            questions: config.questions.filter((_, itemIndex) => itemIndex !== index),
                          }))} type="button">Quitar pregunta</button>
                        </div>
                      ))}
                    </>
                  )}
                  {activityForm.game_type === 'matching' && (
                    <>
                      <div className="admin-repeatable-heading">
                        <strong>Parejas para relacionar</strong>
                        <button className="admin-add-row-button" disabled={activityForm.config.pairs.length >= 50} onClick={() => updateConfig((config) => ({
                          ...config,
                          pairs: [...config.pairs, { id: createEntryId('m'), left: '', right: '' }],
                        }))} type="button">＋ Agregar pareja</button>
                      </div>
                      {(activityForm.config.pairs || []).map((pair, index) => (
                        <div className="admin-repeatable-row" key={pair.id}>
                          <GameContentField
                            label="Contenido izquierdo"
                            contentType={activityForm.content_input_type}
                            csrfTokenRef={csrfTokenRef}
                            onCsrfToken={updateCsrfToken}
                            onChange={(value) => updateConfig((config) => ({
                              ...config,
                              pairs: config.pairs.map((entry, itemIndex) => itemIndex === index
                                ? { ...entry, left: value } : entry),
                            }))}
                            value={pair.left}
                          />
                          <GameContentField
                            label="Contenido derecho"
                            contentType={activityForm.content_input_type}
                            csrfTokenRef={csrfTokenRef}
                            onCsrfToken={updateCsrfToken}
                            onChange={(value) => updateConfig((config) => ({
                              ...config,
                              pairs: config.pairs.map((entry, itemIndex) => itemIndex === index
                                ? { ...entry, right: value } : entry),
                            }))}
                            value={pair.right}
                          />
                          <button aria-label={`Quitar pareja ${index + 1}`} className="admin-remove-row-button" disabled={activityForm.config.pairs.length <= 1} onClick={() => updateConfig((config) => ({
                                ...config,
                            pairs: config.pairs.filter((_, itemIndex) => itemIndex !== index),
                          }))} type="button">×</button>
                        </div>
                      ))}
                    </>
                  )}
                  {!gameTypes.some(([type]) => type === activityForm.game_type) && (
                    <p className="admin-field-hint">
                      Este minijuego usa un formato anterior. Su contenido actual se conserva sin cambios. Selecciona uno de los cuatro tipos disponibles para crear contenido con el editor visual.
                    </p>
                  )}
                </section>

                <section className="admin-editor-section">
                  <div className="admin-editor-section-title">
                    <span className="admin-editor-step">4</span>
                    <div><h4>Recompensas y desbloqueo</h4><p>Elige qué obtiene y cuándo se habilita.</p></div>
                  </div>
                  <div className="admin-form-grid">
                    <label>
                      Estrellas *
                      <input max="3" min="0" onChange={(event) => setActivityForm({ ...activityForm, reward_stars: Number(event.target.value) })} required type="number" value={activityForm.reward_stars} />
                    </label>
                    <label>
                      Monedas *
                      <input max="100000" min="0" onChange={(event) => setActivityForm({ ...activityForm, reward_coins: Number(event.target.value) })} required type="number" value={activityForm.reward_coins} />
                    </label>
                    <label>
                      Insignia por logro
                      <select onChange={(event) => {
                        const achievement = achievements.find((item) => String(item.id) === event.target.value);
                        setActivityForm({
                          ...activityForm,
                          achievement_id: event.target.value,
                          badge_name: achievement?.name || '',
                        });
                      }} value={activityForm.achievement_id}>
                        <option value="">Sin insignia</option>
                        {achievements.map((achievement) => <option key={achievement.id} value={achievement.id}>{achievement.name}</option>)}
                      </select>
                    </label>
                    <label>
                      Recompensa visual
                      <select onChange={(event) => setActivityForm({ ...activityForm, reward_item_id: event.target.value })} value={activityForm.reward_item_id}>
                        <option value="">Sin recompensa visual</option>
                        {rewards.map((reward) => <option key={reward.id} value={reward.id}>{reward.name} · {reward.type}</option>)}
                      </select>
                    </label>
                  </div>
                  {achievements.length === 0 && (
                    <span className="admin-field-hint">No hay logros en el catálogo. Ejecuta el seeder de demostración para cargar ejemplos.</span>
                  )}
                  {rewards.length === 0 && (
                    <span className="admin-field-hint">No hay recompensas en el catálogo. Ejecuta el seeder de demostración para cargar ejemplos.</span>
                  )}
                  <label>
                    Desbloquear después de completar
                    <input min="0" onChange={(event) => setActivityForm({ ...activityForm, unlock_after: Number(event.target.value) })} type="number" value={activityForm.unlock_after ?? 0} />
                    <span className="admin-field-hint">Actividades completadas en esta materia. 0 = disponible desde el inicio.</span>
                  </label>
                </section>
                <button className="admin-primary-button" disabled={submitting} type="submit">
                  {editingActivityId ? 'Guardar cambios' : 'Crear actividad'}
                  <span className="material-symbols-outlined">check</span>
                </button>
                {editingActivityId && (
                  <button
                    className="admin-cancel-button"
                    onClick={() => {
                      setEditingActivityId(null);
                      setActivityForm(emptyActivity(selectedSubjectId));
                    }}
                    type="button"
                  >
                    Cancelar edición
                  </button>
                )}
              </form>}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

export default AdminPanel;
