$(document).ready(function() {
    let currentIndex = 0; 
    let currentCategory = 'operation'; 
    let data = []; 


    loadTableData(currentCategory);

    $('.tabs ul li').on('click', function() {
        $('.tabs ul li').removeClass('is-active');
        $(this).addClass('is-active');
        const target = $(this).data('target');
        currentCategory = target;
        loadTableData(currentCategory);
    });

    console.log(currentCategory);

    function loadTableData(category) {
        $.getJSON(`./static/data/case_${category}.json`)
            .done(function(response) {
                data = response; 
                if (data.length > 0) {
                    currentIndex = 0; 
                    showItem(currentIndex); 
                    setColorScheme(category);
                } else {
                    $('#content-area').html('<p>There are no available data for this category.</p>');
                }
            })
            .fail(function(jqxhr, textStatus, error) {
                let err = textStatus + ", " + error;
                $('#content-area').html(`Error loading data. ${err}`);
            });
    }

    function escapeHtml(html) {
        return html
            .replace(/&/g, '&amp;')  // 转义 & 符号
            .replace(/</g, '&lt;')   // 转义 < 符号
            .replace(/>/g, '&gt;')   // 转义 > 符号
            .replace(/"/g, '&quot;') // 转义 " 符号
            .replace(/'/g, '&#39;'); // 转义 ' 符号
    }
    
    function showItem(index) {
        const entry = data[index];
        if (entry) {
            if (currentCategory !== 'multiq' && currentCategory !== 'multir' && currentCategory !== 'multirq') {
                $('#rule-content').html(escapeHtml(entry.rule_content).replace(/\n/g, '<br>'));
                $('#question-content').html(escapeHtml(entry.question).replace(/\n/g, '<br>'));
                $('#answer-content').html(escapeHtml(entry.answer).replace(/\n/g, '<br>'));
                $('#model-response').html(escapeHtml(entry.response).replace(/\n/g, '<br>'));
            } 
            else {
                let ruleContent = '';
                if (Array.isArray(entry.rule_content_list)) {
                    entry.rule_content_list.forEach((content, index) => {
                        ruleContent += `<h5>Rule ${index + 1}:</h5>`; // 添加小标题
                        ruleContent += escapeHtml(content).replace(/\n/g, '<br>') + '<br><br>';
                    });
                }
                $('#rule-content').html(ruleContent);
            
                let questionContent = '';
                if (Array.isArray(entry.question_content_list)) {
                    entry.question_content_list.forEach((question, index) => {
                        questionContent += `<h5>Question ${index + 1}:</h5>`; // 添加小标题
                        questionContent += escapeHtml(question).replace(/\n/g, '<br>') + '<br><br>';
                    });
                }
                $('#question-content').html(questionContent);
            
                let answerContent = '';
                if (Array.isArray(entry.answer_content_list)) {
                    entry.answer_content_list.forEach((answer, index) => {
                        answerContent += `<h5>Answer ${index + 1}:</h5>`; // 添加小标题
                        answerContent += escapeHtml(answer).replace(/\n/g, '<br>') + '<br><br>';
                    });
                }
                $('#answer-content').html(answerContent);
                $('#model-response').html(escapeHtml(entry.response).replace(/\n/g, '<br>'));
            }
            
        }
    }
    

    $('.prev').on('click', function() {
        if (data.length > 0) {
            currentIndex = (currentIndex > 0) ? currentIndex - 1 : data.length - 1; 
            showItem(currentIndex);
        }
    });

    $('.next').on('click', function() {
        if (data.length > 0) {
            currentIndex = (currentIndex < data.length - 1) ? currentIndex + 1 : 0; 
            showItem(currentIndex);
        }
    });

    function setColorScheme(category) {
        let boxColor, scrollbarColor, scrollbarThumbColor;

        switch (category) {
            case 'operation':
                boxColor = 'linear-gradient(145deg, rgba(240, 247, 255, 0.1), rgba(214, 233, 255, 0.4))';
                scrollbarColor = '#f1f1f1';
                scrollbarThumbColor = '#bcd4e5';
                break;
            case 'logic':
                boxColor = 'linear-gradient(145deg, rgba(240, 240, 255, 0.1), rgba(240, 240, 255, 0.6))'; // 非常浅的紫色
                scrollbarColor = '#f1f1f1';
                scrollbarThumbColor = '#d5b0e7'; // 浅紫色
                break;
            case 'cipher':
                boxColor = 'linear-gradient(145deg, rgba(255, 240, 220, 0.1), rgba(255, 230, 180, 0.2))'; // 非常浅的橙色
                scrollbarColor = '#f1f1f1';
                scrollbarThumbColor = '#ffd3a5'; // 浅橙色
                break;
            case 'puzzle':
                boxColor = 'linear-gradient(145deg, rgba(255, 240, 240, 0.05), rgba(255, 180, 180, 0.2))'; // 非常浅的红色
                scrollbarColor = '#f1f1f1';
                scrollbarThumbColor = '#ffb3b3'; // 浅红色
                break;
            case 'counterfactual':
                boxColor = 'linear-gradient(145deg, rgba(220, 255, 220, 0.05), rgba(150, 255, 150, 0.1))'; // 非常浅的绿色
                scrollbarColor = '#f1f1f1';
                scrollbarThumbColor = '#b3ffb3'; // 浅绿色
                break;
            case 'multiq':
                boxColor = 'linear-gradient(145deg, rgba(220, 220, 255, 0.05), rgba(170, 170, 255, 0.1))'; // 更浅的蓝色
                scrollbarColor = '#f1f1f1';
                scrollbarThumbColor = '#b3d7eb'; // 更浅的蓝色
                break;
            case 'multir':
                boxColor = 'linear-gradient(145deg, rgba(255, 255, 220, 0.05), rgba(255, 255, 170, 0.1))'; // 更浅的黄色
                scrollbarColor = '#f1f1f1';
                scrollbarThumbColor = '#ffedb3'; // 更浅的米色
                break;
            case 'multirq':
                boxColor = 'linear-gradient(145deg, rgba(255, 200, 255, 0.05), rgba(255, 150, 255, 0.1))'; // 更浅的粉色
                scrollbarColor = '#f1f1f1';
                scrollbarThumbColor = '#ffb3e6'; // 更浅的粉色
                break;
            default:
                boxColor = 'linear-gradient(145deg, rgba(240, 247, 255, 0.1), rgba(214, 233, 255, 0.4))'; // 默认颜色
                scrollbarColor = '#f1f1f1';
                scrollbarThumbColor = '#bcd4e5'; // 默认滚动条颜色
                break;
        }

        // 更新 box 的背景颜色
        $('.scroll-box').css({
            'background': boxColor,
            'border': '1px solid #d3d3d3' // 保持边框颜色
        });

        // 使用 CSS 变量更新滚动条颜色
        document.documentElement.style.setProperty('--scrollbar-color', scrollbarColor);
        document.documentElement.style.setProperty('--scrollbar-thumb-color', scrollbarThumbColor);
        }
});
