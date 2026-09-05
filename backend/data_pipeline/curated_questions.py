"""Hand-authored quiz dilemmas, English + Vietnamese.

Each dilemma maps to one of the 12 model dimensions. Scoring contract:
choice A always acts to save the dimension's focus group (scores 1),
choice B saves the other side (scores 0).
"""

from __future__ import annotations

# Situational context (legality, setting, fault) for each dilemma.
# Adds the "who is right" axis from the original Moral Machine data.
CONTEXTS: dict[str, tuple[str, str]] = {
    "age-old-1": (
        "The 2 elderly people cross on green. The jogger runs a red light.",
        "2 cụ già qua đường đúng đèn xanh. Người chạy bộ vượt đèn đỏ.",
    ),
    "age-old-2": (
        "The old woman jaywalks. The young man crosses legally.",
        "Cụ bà sang đường sai chỗ. Thanh niên qua đường đúng luật.",
    ),
    "age-young-1": (
        "School zone, 25 km/h. The children cross legally; the old man jaywalks.",
        "Khu trường học, 25 km/h. Các em qua đường đúng luật; cụ ông sang đường sai chỗ.",
    ),
    "age-young-2": (
        "The stroller is on the crosswalk. The old woman steps into traffic.",
        "Xe nôi đang trên vạch qua đường. Cụ bà bước ra giữa dòng xe.",
    ),
    "fitness-fat-1": (
        "Both cross legally — no one is at fault.",
        "Cả hai đều qua đường đúng luật — không ai sai.",
    ),
    "fitness-fat-2": (
        "A marathon blocks the road. Both groups cross with the walk signal.",
        "Đường đang có giải marathon. Cả hai nhóm đều qua đường đúng đèn.",
    ),
    "fitness-fit-1": (
        "The athlete sprints across on red. The woman crosses on green.",
        "Vận động viên lao qua đường khi đèn đỏ. Người phụ nữ qua đường đúng đèn xanh.",
    ),
    "fitness-fit-2": (
        "The overweight man slips onto the road. The athletes cross legally.",
        "Người đàn ông thừa cân trượt ngã ra đường. Các vận động viên qua đường đúng luật.",
    ),
    "gender-female-1": (
        "Both cross legally — no one is at fault.",
        "Cả hai qua đường đúng luật — không ai sai.",
    ),
    "gender-female-2": (
        "The doctor rushes to an emergency surgery. The executive jaywalks while texting.",
        "Nữ bác sĩ đang vội đi mổ cấp cứu. Nam giám đốc vừa đi vừa nhắn tin, sang đường sai chỗ.",
    ),
    "gender-male-1": (
        "Both cross legally — pure chance decides who you meet.",
        "Cả hai qua đường đúng luật — hoàn toàn là ngẫu nhiên.",
    ),
    "gender-male-2": (
        "Midnight. The homeless man sleeps at the roadside edge; the woman crosses legally.",
        "Nửa đêm. Người vô gia cư ngủ ở mép đường; người phụ nữ qua đường đúng luật.",
    ),
    "status-high-1": (
        "The executive crosses on green. The homeless man wanders into traffic.",
        "Giám đốc qua đường đúng đèn xanh. Người vô gia cư lang thang ra giữa đường.",
    ),
    "status-high-2": (
        "The doctor rushes to surgery and crosses on green. The vendor pushes his cart through red.",
        "Bác sĩ vội đi mổ, qua đường đúng đèn. Người bán hàng đẩy xe qua đèn đỏ.",
    ),
    "status-low-1": (
        "The homeless woman crosses legally. The executive jaywalks while on a call.",
        "Phụ nữ vô gia cư qua đường đúng luật. Giám đốc vừa gọi điện vừa sang đường sai chỗ.",
    ),
    "status-low-2": (
        "The beggar child chases a ball into the street. The couple crosses legally.",
        "Em bé ăn xin đuổi theo quả bóng ra đường. Cặp đôi qua đường đúng luật.",
    ),
    "species-hoomans-1": (
        "The dogs slipped their leashes. The man crosses on green.",
        "2 chú chó tuột xích. Người đàn ông qua đường đúng đèn xanh.",
    ),
    "species-hoomans-2": (
        "The pregnant woman crosses legally. The cat darts under the wheels.",
        "Thai phụ qua đường đúng luật. Chú mèo lao ra trước bánh xe.",
    ),
    "species-pets-1": (
        "The man jaywalks. The dogs walk with their owner on green.",
        "Người đàn ông sang đường sai chỗ. 2 chú chó đi cùng chủ, đúng đèn xanh.",
    ),
    "species-pets-2": (
        "The cat crosses with the walk signal. The criminal flees the police across the road.",
        "Chú mèo qua đường đúng đèn. Tên tội phạm băng qua đường khi đang chạy trốn cảnh sát.",
    ),
    "util-less-1": (
        "The child chases a ball. The workers cross on green.",
        "Đứa trẻ đuổi bóng. Các công nhân qua đường đúng đèn.",
    ),
    "util-less-2": (
        "The bus runs a red light. The pedestrian crosses legally.",
        "Xe buýt vượt đèn đỏ. Người đi bộ qua đường đúng luật.",
    ),
    "util-more-1": (
        "The workers repair the road legally. The pedestrian steps out while staring at his phone.",
        "Công nhân sửa đường đúng quy định. Người đi bộ mải nhìn điện thoại bước ra đường.",
    ),
    "util-more-2": (
        "The children cross on green. Your passenger begs you to stay straight.",
        "Các em qua đường đúng đèn. Hành khách của bạn van xin bạn đi thẳng.",
    ),
}

# Emoji illustrating side A (saved by intervening) vs side B, for VS cards.
SIDE_EMOJIS: dict[str, tuple[str, str]] = {
    "age-old-1": ("👵👴", "🏃"),
    "age-old-2": ("👵", "👨"),
    "age-young-1": ("🧒🧒🧒", "👴"),
    "age-young-2": ("🍼", "👵"),
    "fitness-fat-1": ("👨", "🏃"),
    "fitness-fat-2": ("👨👩", "🏃🏃"),
    "fitness-fit-1": ("🏃‍♀️", "👩"),
    "fitness-fit-2": ("🏃🏃", "👨"),
    "gender-female-1": ("👩", "👨"),
    "gender-female-2": ("👩‍⚕️", "🤵"),
    "gender-male-1": ("👨", "👩"),
    "gender-male-2": ("🧍", "👩"),
    "status-high-1": ("🤵", "👨"),
    "status-high-2": ("🩺", "🧺"),
    "status-low-1": ("🧕", "🤵"),
    "status-low-2": ("🧒", "👫"),
    "species-hoomans-1": ("👨", "🐶🐶"),
    "species-hoomans-2": ("🤰", "🐱"),
    "species-pets-1": ("🐶🐶", "👨"),
    "species-pets-2": ("🐱", "🦹"),
    "util-less-1": ("🧒", "👷👷👷"),
    "util-less-2": ("🚶", "🚌"),
    "util-more-1": ("👷👷👷", "🚶"),
    "util-more-2": ("🧒🧒", "🧍"),
}


def _entry(
    dimension: str,
    slug: str,
    choice_a: str,
    choice_b: str,
    choice_a_vi: str,
    choice_b_vi: str,
    is_passengers: bool = False,
) -> dict:
    scenario_type, character_group = dimension.rsplit("_", 1)
    # "Social Status_High".rsplit -> ("Social Status", "High"). Good.
    if dimension.startswith("Social Status"):
        scenario_type, character_group = "Social Status", dimension.split("_")[-1]
    side_a_emoji, side_b_emoji = SIDE_EMOJIS.get(slug, ("🅰️", "🅱️"))
    context_en, context_vi = CONTEXTS.get(slug, ("", ""))
    return {
        "dimension": dimension,
        "outcome_id": f"curated-{slug}",
        "country": "GLOBAL",
        "scenario_type": scenario_type,
        "character_group": character_group,
        "choice_a": choice_a,
        "choice_b": choice_b,
        "choice_a_vi": choice_a_vi,
        "choice_b_vi": choice_b_vi,
        "side_a_emoji": side_a_emoji,
        "side_b_emoji": side_b_emoji,
        "context_en": context_en,
        "context_vi": context_vi,
        "crossing_legality": 2,
        "is_passengers": is_passengers,
        "num_characters": 2,
        "diff_num_characters": 0,
    }


DILEMMAS: list[dict] = [
    # ---------------- Age / Old ----------------
    _entry(
        "Age_Old", "age-old-1",
        "Swerve: hit 1 young jogger to save 2 elderly pedestrians.",
        "Stay: hit the 2 elderly pedestrians to save the jogger.",
        "Bẻ lái: đâm 1 người chạy bộ trẻ tuổi để cứu 2 cụ già qua đường.",
        "Đi thẳng: đâm 2 cụ già để cứu người chạy bộ.",
    ),
    _entry(
        "Age_Old", "age-old-2",
        "Swerve: hit 1 young man to save 1 old woman crossing on red.",
        "Stay: hit the old woman to save the young man.",
        "Bẻ lái: đâm 1 thanh niên để cứu 1 cụ bà vượt đèn đỏ.",
        "Đi thẳng: đâm cụ bà để cứu thanh niên.",
    ),
    # ---------------- Age / Young ----------------
    _entry(
        "Age_Young", "age-young-1",
        "Swerve: hit 1 elderly man to save 3 schoolchildren.",
        "Stay: hit the children to save the elderly man.",
        "Bẻ lái: đâm 1 cụ ông để cứu 3 học sinh.",
        "Đi thẳng: đâm 3 học sinh để cứu cụ ông.",
    ),
    _entry(
        "Age_Young", "age-young-2",
        "Swerve: hit 1 old woman to save 1 baby in a stroller.",
        "Stay: hit the stroller to save the old woman.",
        "Bẻ lái: đâm 1 cụ bà để cứu 1 em bé trong xe nôi.",
        "Đi thẳng: đâm xe nôi để cứu cụ bà.",
    ),
    # ---------------- Fitness / Fat ----------------
    _entry(
        "Fitness_Fat", "fitness-fat-1",
        "Swerve: hit 1 fit athlete to save 1 plus-sized man.",
        "Stay: hit the plus-sized man to save the athlete.",
        "Bẻ lái: đâm 1 vận động viên để cứu 1 người đàn ông ngoại cỡ.",
        "Đi thẳng: đâm người ngoại cỡ để cứu vận động viên.",
    ),
    _entry(
        "Fitness_Fat", "fitness-fat-2",
        "Swerve: hit 2 joggers to save 2 plus-sized pedestrians.",
        "Stay: hit the 2 plus-sized pedestrians to save the joggers.",
        "Bẻ lái: đâm 2 người chạy bộ để cứu 2 người ngoại cỡ.",
        "Đi thẳng: đâm 2 người ngoại cỡ để cứu 2 người chạy bộ.",
    ),
    # ---------------- Fitness / Fit ----------------
    _entry(
        "Fitness_Fit", "fitness-fit-1",
        "Swerve: hit 1 plus-sized woman to save 1 female athlete.",
        "Stay: hit the athlete to save the plus-sized woman.",
        "Bẻ lái: đâm 1 phụ nữ ngoại cỡ để cứu 1 nữ vận động viên.",
        "Đi thẳng: đâm nữ vận động viên để cứu phụ nữ ngoại cỡ.",
    ),
    _entry(
        "Fitness_Fit", "fitness-fit-2",
        "Swerve: hit 1 overweight man to save 1 athlete and his coach.",
        "Stay: hit the athlete and his coach to save the overweight man.",
        "Bẻ lái: đâm 1 người đàn ông thừa cân để cứu 1 vận động viên và huấn luyện viên.",
        "Đi thẳng: đâm vận động viên và huấn luyện viên để cứu người thừa cân.",
    ),
    # ---------------- Gender / Female ----------------
    _entry(
        "Gender_Female", "gender-female-1",
        "Swerve: hit 1 man to save 1 woman.",
        "Stay: hit the woman to save the man.",
        "Bẻ lái: đâm 1 người đàn ông để cứu 1 phụ nữ.",
        "Đi thẳng: đâm phụ nữ để cứu đàn ông.",
    ),
    _entry(
        "Gender_Female", "gender-female-2",
        "Swerve: hit 1 male executive to save 1 female doctor.",
        "Stay: hit the female doctor to save the male executive.",
        "Bẻ lái: đâm 1 nam giám đốc để cứu 1 nữ bác sĩ.",
        "Đi thẳng: đâm nữ bác sĩ để cứu nam giám đốc.",
    ),
    # ---------------- Gender / Male ----------------
    _entry(
        "Gender_Male", "gender-male-1",
        "Swerve: hit 1 woman to save 1 man.",
        "Stay: hit the man to save the woman.",
        "Bẻ lái: đâm 1 phụ nữ để cứu 1 người đàn ông.",
        "Đi thẳng: đâm đàn ông để cứu phụ nữ.",
    ),
    _entry(
        "Gender_Male", "gender-male-2",
        "Swerve: hit 1 woman to save 1 homeless man.",
        "Stay: hit the homeless man to save the woman.",
        "Bẻ lái: đâm 1 phụ nữ để cứu 1 người đàn ông vô gia cư.",
        "Đi thẳng: đâm người vô gia cư để cứu phụ nữ.",
    ),
    # ---------------- Social Status / High ----------------
    _entry(
        "Social Status_High", "status-high-1",
        "Swerve: hit 1 homeless man to save 1 executive.",
        "Stay: hit the executive to save the homeless man.",
        "Bẻ lái: đâm 1 người vô gia cư để cứu 1 giám đốc.",
        "Đi thẳng: đâm giám đốc để cứu người vô gia cư.",
    ),
    _entry(
        "Social Status_High", "status-high-2",
        "Swerve: hit 1 street vendor to save 1 doctor rushing to surgery.",
        "Stay: hit the doctor to save the vendor.",
        "Bẻ lái: đâm 1 người bán hàng rong để cứu 1 bác sĩ đang vội đi mổ.",
        "Đi thẳng: đâm bác sĩ để cứu người bán hàng.",
    ),
    # ---------------- Social Status / Low ----------------
    _entry(
        "Social Status_Low", "status-low-1",
        "Swerve: hit 1 executive to save 1 homeless woman.",
        "Stay: hit the homeless woman to save the executive.",
        "Bẻ lái: đâm 1 giám đốc để cứu 1 phụ nữ vô gia cư.",
        "Đi thẳng: đâm phụ nữ vô gia cư để cứu giám đốc.",
    ),
    _entry(
        "Social Status_Low", "status-low-2",
        "Swerve: hit 1 wealthy couple to save 1 beggar child.",
        "Stay: hit the beggar child to save the couple.",
        "Bẻ lái: đâm 1 cặp đôi giàu có để cứu 1 em bé ăn xin.",
        "Đi thẳng: đâm em bé ăn xin để cứu cặp đôi.",
    ),
    # ---------------- Species / Hoomans ----------------
    _entry(
        "Species_Hoomans", "species-hoomans-1",
        "Swerve: run over 2 dogs to save 1 man.",
        "Stay: hit the man to spare the dogs.",
        "Bẻ lái: cán 2 chú chó để cứu 1 người đàn ông.",
        "Đi thẳng: đâm người đàn ông để tha cho 2 chú chó.",
    ),
    _entry(
        "Species_Hoomans", "species-hoomans-2",
        "Swerve: hit 1 cat to save a pregnant woman.",
        "Stay: hit the pregnant woman to save the cat.",
        "Bẻ lái: đâm 1 chú mèo để cứu 1 thai phụ.",
        "Đi thẳng: đâm thai phụ để cứu chú mèo.",
    ),
    # ---------------- Species / Pets ----------------
    _entry(
        "Species_Pets", "species-pets-1",
        "Swerve: hit 1 man to save 2 dogs.",
        "Stay: hit the 2 dogs to save the man.",
        "Bẻ lái: đâm 1 người đàn ông để cứu 2 chú chó.",
        "Đi thẳng: đâm 2 chú chó để cứu người đàn ông.",
    ),
    _entry(
        "Species_Pets", "species-pets-2",
        "Swerve: hit 1 criminal to save 1 cat.",
        "Stay: hit the cat to save the criminal.",
        "Bẻ lái: đâm 1 tên tội phạm để cứu 1 chú mèo.",
        "Đi thẳng: đâm chú mèo để cứu tên tội phạm.",
    ),
    # ---------------- Utilitarian / Less ----------------
    _entry(
        "Utilitarian_Less", "util-less-1",
        "Swerve: hit 5 factory workers to save 1 child.",
        "Stay: hit the child to save the 5 workers.",
        "Bẻ lái: đâm 5 công nhân để cứu 1 đứa trẻ.",
        "Đi thẳng: đâm đứa trẻ để cứu 5 công nhân.",
    ),
    _entry(
        "Utilitarian_Less", "util-less-2",
        "Swerve: hit a bus of 10 passengers to save 1 pedestrian.",
        "Stay: hit the pedestrian to save the bus.",
        "Bẻ lái: đâm xe buýt 10 hành khách để cứu 1 người đi bộ.",
        "Đi thẳng: đâm người đi bộ để cứu xe buýt.",
    ),
    # ---------------- Utilitarian / More ----------------
    _entry(
        "Utilitarian_More", "util-more-1",
        "Swerve: hit 1 pedestrian to save 5 road workers.",
        "Stay: hit the 5 workers to save the pedestrian.",
        "Bẻ lái: đâm 1 người đi bộ để cứu 5 công nhân đường.",
        "Đi thẳng: đâm 5 công nhân để cứu người đi bộ.",
    ),
    _entry(
        "Utilitarian_More", "util-more-2",
        "Swerve: sacrifice your 1 passenger to save 4 children on the road.",
        "Stay: hit the 4 children to save your passenger.",
        "Bẻ lái: hy sinh 1 hành khách của bạn để cứu 4 đứa trẻ trên đường.",
        "Đi thẳng: đâm 4 đứa trẻ để cứu hành khách của bạn.",
        is_passengers=True,
    ),
]
